"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { event, eventOrder, eventAttendees } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

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
    .from(eventAttendees)
    .where(
      and(
        eq(eventAttendees.eventId, eventId),
        eq(eventAttendees.userId, userId)
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
      .from(eventAttendees)
      .where(eq(eventAttendees.ticketCode, ticketCode))
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
    await db.insert(eventAttendees).values({
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

  const [existingAttendee] = await db
    .select()
    .from(eventAttendees)
    .where(
      and(
        eq(eventAttendees.eventId, eventId),
        eq(eventAttendees.userId, userId)
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
      .from(eventAttendees)
      .where(eq(eventAttendees.ticketCode, ticketCode))
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
      txHash: txHash.trim() || null,
    });
    await db.insert(eventAttendees).values({
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
