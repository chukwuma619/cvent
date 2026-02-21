"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { event, eventTicket, type Event } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { verifyAllPendingPaymentOrders } from "@/lib/discover/actions";

export type CreateEventInput = Omit<
  Event,
  "id" | "hostedBy" | "createdAt" | "updatedAt"
>;

export async function createEvent({
  data,
  userId: userIdParam,
}: {
  data: CreateEventInput;
  userId?: string;
}) {
  try {
    const userId =
      userIdParam ??
      (await auth.api.getSession({ headers: await headers() }))?.user?.id;
    if (!userId) {
      return { success: false as const, error: "You must be signed in." };
    }

    const [inserted] = await db
      .insert(event)
      .values({
        ...data,
        id: crypto.randomUUID(),
        hostedBy: userId,
      })
      .returning();
    if (!inserted) {
      return { success: false as const, error: "Failed to create event." };
    }
    return { success: true as const, eventId: inserted.id };
  } catch (err) {
    console.error("createEvent error:", err);
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to create event.",
    };
  }
}

export async function updateEvent(eventId: string, data: Partial<CreateEventInput>) {
  try {
    const [updated] = await db
      .update(event)
      .set(data)
      .where(eq(event.id, eventId))
      .returning();

    return { data: updated, error: null };
  } catch (err) {
    console.error("updateEvent error:", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to update event.",
    };
  }
}

export type CheckInResult =
  | { success: true; alreadyCheckedIn?: boolean }
  | { success: false; error: string };

export async function checkInAttendee(
  eventId: string,
  ticketCode: string
): Promise<CheckInResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "You must be signed in." };
    }

    const [eventRow] = await db
      .select({ hostedBy: event.hostedBy })
      .from(event)
      .where(eq(event.id, eventId))
      .limit(1);
    if (!eventRow || eventRow.hostedBy !== session.user.id) {
      return { success: false, error: "You can only check in attendees for your own events." };
    }

    const code = ticketCode.trim().toUpperCase();
    if (!code) {
      return { success: false, error: "Enter a ticket code." };
    }

    const [attendee] = await db
      .select({ id: eventTicket.id, checkedInAt: eventTicket.checkedInAt })
      .from(eventTicket)
      .where(
        and(
          eq(eventTicket.eventId, eventId),
          eq(eventTicket.ticketCode, code)
        )
      )
      .limit(1);

    if (!attendee) {
      return { success: false, error: "Ticket not found for this event." };
    }
    if (attendee.checkedInAt) {
      return { success: true, alreadyCheckedIn: true };
    }

    await db
      .update(eventTicket)
      .set({ checkedInAt: new Date() })
      .where(eq(eventTicket.id, attendee.id));

    revalidatePath(`/dashboard/${eventId}`);
    return { success: true };
  } catch (err) {
    console.error("checkInAttendee error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Check-in failed.",
    };
  }
}

export type RunPaymentVerificationResult =
  | { ok: true; checked: number; verified: number }
  | { ok: false; error: string };

/** Run on-chain verification for pending paid orders. Use when cron is disabled (e.g. Vercel Hobby). */
export async function runPaymentVerification(): Promise<RunPaymentVerificationResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in." };
  }
  try {
    const result = await verifyAllPendingPaymentOrders();
    revalidatePath("/dashboard/earnings");
    return { ok: true, checked: result.checked, verified: result.verified };
  } catch (err) {
    console.error("runPaymentVerification error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Verification failed.",
    };
  }
}
