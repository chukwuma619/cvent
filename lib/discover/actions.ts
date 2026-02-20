"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { event, eventOrder, eventTicket, user } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  getMinShannonsForPriceCents,
  verifyTransactionPaysRecipient,
} from "@/lib/ckb";

function generateTicketCode(): string {
  return crypto.randomUUID().replace(/-/g, "").toLowerCase().slice(0, 12);
}

export type RegisterResult =
  | { success: true; ticketCode: string }
  | { success: false; error: string };

export async function registerForEvent(eventId: string): Promise<RegisterResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) {
    return {
      success: false,
      error: "You must be signed in to get a ticket.",
    };
  }

  const [eventRow] = await db
    .select()
    .from(event)
    .where(eq(event.id, eventId))
    .limit(1);

  if (!eventRow) {
    return { success: false, error: "Event not found." };
  }

  if (eventRow.priceCents > 0) {
    return {
      success: false,
      error: "Pay with CKB is not available yet. This is a paid event.",
    };
  }

  const [existingAttendee] = await db
    .select()
    .from(eventTicket)
    .where(
      and(
        eq(eventTicket.eventId, eventId),
        eq(eventTicket.userId, userId)
      )
    )
    .limit(1);

  if (existingAttendee) {
    return {
      success: true,
      ticketCode: existingAttendee.ticketCode,
    };
  }

  const orderId = crypto.randomUUID();
  const attendeeId = crypto.randomUUID();
  let ticketCode = generateTicketCode();

  for (let attempt = 0; attempt < 5; attempt++) {
    const [existingCode] = await db
      .select()
      .from(eventTicket)
      .where(eq(eventTicket.ticketCode, ticketCode))
      .limit(1);
    if (!existingCode) break;
    ticketCode = generateTicketCode();
  }

  try {
    await db.insert(eventOrder).values({
      id: orderId,
      eventId,
      userId,
      amountCkbShannons: 0,
      status: "paid",
      txHash: null,
    });
    await db.insert(eventTicket).values({
      id: attendeeId,
      eventId,
      userId,
      orderId,
      eventOrderId: orderId,
      ticketCode,
    });
  } catch (err) {
    console.error("registerForEvent error:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to register for event.",
    };
  }

  return { success: true, ticketCode };
}

export async function confirmPaidRegistration(
  eventId: string,
  txHash: string,
  amountCkbShannons: number
): Promise<RegisterResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "You must be signed in." };
  }

  const [eventRow] = await db
    .select()
    .from(event)
    .where(eq(event.id, eventId))
    .limit(1);

  if (!eventRow) {
    return { success: false, error: "Event not found." };
  }

  if (eventRow.priceCents <= 0) {
    return { success: false, error: "Event is free; use Get ticket instead." };
  }

  const trimmedTxHash = txHash.trim();
  if (!trimmedTxHash) {
    return { success: false, error: "Transaction hash is required." };
  }

  const [existingOrderWithTx] = await db
    .select({ id: eventOrder.id })
    .from(eventOrder)
    .where(eq(eventOrder.txHash, trimmedTxHash))
    .limit(1);
  if (existingOrderWithTx) {
    return {
      success: false,
      error: "This payment has already been used.",
    };
  }

  let minShannons: number;
  try {
    minShannons = await getMinShannonsForPriceCents(
      eventRow.priceCents,
      eventRow.currency
    );
  } catch (err) {
    console.error("getMinShannonsForPriceCents error:", err);
    return {
      success: false,
      error: "Could not verify event price. Try again later.",
    };
  }
  if (amountCkbShannons < minShannons) {
    return {
      success: false,
      error: "Payment amount is below the event price.",
    };
  }

  const [hostUser] = await db
    .select({ walletAddress: user.walletAddress })
    .from(user)
    .where(eq(user.id, eventRow.hostedBy))
    .limit(1);
  const hostWalletAddress = hostUser?.walletAddress?.trim() ?? null;
  if (!hostWalletAddress) {
    return {
      success: false,
      error: "Host has not set a wallet; payment cannot be verified.",
    };
  }

  const ckbRpcUrl = process.env.CKB_RPC_URL?.trim();
  if (ckbRpcUrl) {
    const verified = await verifyTransactionPaysRecipient(
      ckbRpcUrl,
      trimmedTxHash,
      hostWalletAddress,
      amountCkbShannons
    );
    if (!verified) {
      return {
        success: false,
        error:
          "Payment could not be verified on-chain. Ensure the transaction is confirmed and sent to the host's wallet.",
      };
    }
  }

  const [existingAttendee] = await db
    .select()
    .from(eventTicket)
    .where(
      and(
        eq(eventTicket.eventId, eventId),
        eq(eventTicket.userId, userId)
      )
    )
    .limit(1);

  if (existingAttendee) {
    return { success: true, ticketCode: existingAttendee.ticketCode };
  }

  const orderId = crypto.randomUUID();
  const attendeeId = crypto.randomUUID();
  let ticketCode = generateTicketCode();

  for (let attempt = 0; attempt < 5; attempt++) {
    const [existingCode] = await db
      .select()
      .from(eventTicket)
      .where(eq(eventTicket.ticketCode, ticketCode))
      .limit(1);
    if (!existingCode) break;
    ticketCode = generateTicketCode();
  }

  try {
    await db.insert(eventOrder).values({
      id: orderId,
      eventId,
      userId,
      amountCkbShannons,
      status: "paid",
      txHash: trimmedTxHash,
    });
    await db.insert(eventTicket).values({
      id: attendeeId,
      eventId,
      userId,
      orderId,
      eventOrderId: orderId,
      ticketCode,
    });
  } catch (err) {
    console.error("confirmPaidRegistration error:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to confirm registration.",
    };
  }

  return { success: true, ticketCode };
}
