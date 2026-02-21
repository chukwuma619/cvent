"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { event, eventOrder, eventTicket } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionFromHeaders } from "@/lib/auth";
import {
  getMinShannonsForPriceCents,
  verifyTransactionPaysRecipient,
} from "@/lib/ckb";

function generateTicketCode(): string {
  return crypto.randomUUID().replace(/-/g, "").toLowerCase().slice(0, 12);
}

export type RegisterResult =
  | { success: true; ticketCode: string }
  | { success: true; pendingVerification: true }
  | { success: false; error: string };

export async function registerForEvent(eventId: string): Promise<RegisterResult> {
  const session = await getSessionFromHeaders(await headers());
  const walletAddress = session?.walletAddress;
  if (!walletAddress) {
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
        eq(eventTicket.walletAddress, walletAddress)
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
      walletAddress,
      amountCkbShannons: 0,
      status: "paid",
      txHash: null,
    });
    await db.insert(eventTicket).values({
      id: attendeeId,
      eventId,
      walletAddress,
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
  const session = await getSessionFromHeaders(await headers());
  const walletAddress = session?.walletAddress;
  if (!walletAddress) {
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

  const hostWalletAddress = eventRow.hostedByWallet?.trim() ?? null;
  if (!hostWalletAddress) {
    return {
      success: false,
      error: "Host wallet not set; payment cannot be verified.",
    };
  }

  const trimmedTxHash = txHash.trim();
  if (!trimmedTxHash) {
    return { success: false, error: "Transaction hash is required." };
  }

  let minShannons: number;
  try {
    minShannons = await getMinShannonsForPriceCents(
      eventRow.priceCents,
      eventRow.currency
    );
  } catch (err) {
    console.error("confirmPaidRegistration getMinShannonsForPriceCents:", err);
    return {
      success: false,
      error: "Could not verify event price. Try again later.",
    };
  }

  const toleranceFactor = 0.99;
  const minShannonsWithTolerance = Math.floor(minShannons * toleranceFactor);
  if (amountCkbShannons < minShannonsWithTolerance) {
    return {
      success: false,
      error: "Payment amount is below the event price.",
    };
  }

  const ckbRpcUrl = process.env.CKB_RPC_URL?.trim();

  const [existingOrder] = await db
    .select()
    .from(eventOrder)
    .where(eq(eventOrder.txHash, trimmedTxHash))
    .limit(1);

  if (existingOrder) {
    if (existingOrder.walletAddress !== walletAddress) {
      return {
        success: false,
        error: "This payment has already been used.",
      };
    }
    if (existingOrder.status === "paid") {
      const [ticket] = await db
        .select({ ticketCode: eventTicket.ticketCode })
        .from(eventTicket)
        .where(eq(eventTicket.eventOrderId, existingOrder.id))
        .limit(1);
      if (ticket) {
        return { success: true, ticketCode: ticket.ticketCode };
      }
    }
    if (existingOrder.status === "pending_verification") {
      const verified = !!ckbRpcUrl && (await verifyTransactionPaysRecipient(
        ckbRpcUrl,
        trimmedTxHash,
        hostWalletAddress,
        amountCkbShannons
      ));
      if (verified) {
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
        await db
          .update(eventOrder)
          .set({ status: "paid" })
          .where(eq(eventOrder.id, existingOrder.id));
        await db.insert(eventTicket).values({
          id: attendeeId,
          eventId,
          walletAddress,
          orderId: existingOrder.id,
          eventOrderId: existingOrder.id,
          ticketCode,
        });
        return { success: true, ticketCode };
      }
      return { success: true, pendingVerification: true };
    }
  }

  const [existingAttendee] = await db
    .select({ ticketCode: eventTicket.ticketCode })
    .from(eventTicket)
    .where(
      and(
        eq(eventTicket.eventId, eventId),
        eq(eventTicket.walletAddress, walletAddress)
      )
    )
    .limit(1);
  if (existingAttendee) {
    return { success: true, ticketCode: existingAttendee.ticketCode };
  }

  const orderId = crypto.randomUUID();
  try {
    await db.insert(eventOrder).values({
      id: orderId,
      eventId,
      walletAddress,
      amountCkbShannons,
      status: "pending_verification",
      txHash: trimmedTxHash,
    });
  } catch (err) {
    console.error("confirmPaidRegistration insert order:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to record payment.",
    };
  }

  const verified = !!ckbRpcUrl && (await verifyTransactionPaysRecipient(
    ckbRpcUrl,
    trimmedTxHash,
    hostWalletAddress,
    amountCkbShannons
  ));

  if (verified) {
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
    await db
      .update(eventOrder)
      .set({ status: "paid" })
      .where(eq(eventOrder.id, orderId));
    await db.insert(eventTicket).values({
      id: attendeeId,
      eventId,
      walletAddress,
      orderId,
      eventOrderId: orderId,
      ticketCode,
    });
    return { success: true, ticketCode };
  }

  return { success: true, pendingVerification: true };
}

export async function verifyPendingOrderForUserEvent(
  eventId: string,
  walletAddress: string
): Promise<void> {
  const ckbRpcUrl = process.env.CKB_RPC_URL?.trim();
  if (!ckbRpcUrl) return;

  const [pendingOrder] = await db
    .select()
    .from(eventOrder)
    .where(
      and(
        eq(eventOrder.eventId, eventId),
        eq(eventOrder.walletAddress, walletAddress),
        eq(eventOrder.status, "pending_verification")
      )
    )
    .limit(1);
  if (!pendingOrder?.txHash) return;

  const [eventRow] = await db
    .select()
    .from(event)
    .where(eq(event.id, eventId))
    .limit(1);
  if (!eventRow || eventRow.priceCents <= 0) return;

  const hostWalletAddress = eventRow.hostedByWallet?.trim() ?? null;
  if (!hostWalletAddress) return;

  const verified = await verifyTransactionPaysRecipient(
    ckbRpcUrl,
    pendingOrder.txHash,
    hostWalletAddress,
    pendingOrder.amountCkbShannons
  );
  if (!verified) return;

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
  await db
    .update(eventOrder)
    .set({ status: "paid" })
    .where(eq(eventOrder.id, pendingOrder.id));
  await db.insert(eventTicket).values({
    id: attendeeId,
    eventId,
    walletAddress,
    orderId: pendingOrder.id,
    eventOrderId: pendingOrder.id,
    ticketCode,
  });
}

export async function verifyAllPendingPaymentOrders(): Promise<{
  checked: number;
  verified: number;
}> {
  const ckbRpcUrl = process.env.CKB_RPC_URL?.trim();
  if (!ckbRpcUrl) return { checked: 0, verified: 0 };

  const orders = await db
    .select()
    .from(eventOrder)
    .where(eq(eventOrder.status, "pending_verification"));
  let verified = 0;

  for (const order of orders) {
    if (!order.txHash) continue;

    const [eventRow] = await db
      .select()
      .from(event)
      .where(eq(event.id, order.eventId))
      .limit(1);
    if (!eventRow || eventRow.priceCents <= 0) continue;

    const hostWalletAddress = eventRow.hostedByWallet?.trim() ?? null;
    if (!hostWalletAddress) continue;

    const txVerified = await verifyTransactionPaysRecipient(
      ckbRpcUrl,
      order.txHash,
      hostWalletAddress,
      order.amountCkbShannons
    );
    if (!txVerified) continue;

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
    await db
      .update(eventOrder)
      .set({ status: "paid" })
      .where(eq(eventOrder.id, order.id));
    await db.insert(eventTicket).values({
      id: attendeeId,
      eventId: order.eventId,
      walletAddress: order.walletAddress,
      orderId: order.id,
      eventOrderId: order.id,
      ticketCode,
    });
    verified += 1;
  }

  return { checked: orders.length, verified };
}
