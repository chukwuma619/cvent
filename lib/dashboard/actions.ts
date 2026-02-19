"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { event, type Event } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export type CreateEventInput = Omit<
  Event,
  "id" | "hostedBy" | "createdAt" | "updatedAt"
>;

export async function createEvent({ data }: { data: CreateEventInput }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    if (!userId) {
      return {
        success: false as const,
        error: "You must be signed in to create an event.",
      };
    }
    const id = crypto.randomUUID();
    const [inserted] = await db
      .insert(event)
      .values({
        ...data,
        id,
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
    return { data: updated ?? null, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to update event.",
    };
  }
}
