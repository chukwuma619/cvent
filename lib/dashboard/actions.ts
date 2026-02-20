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

export async function createEvent({ data, userId }: { data: CreateEventInput, userId: string }) {
  try {
    
    const [inserted] = await db
      .insert(event)
      .values({
        ...data,
        id: crypto.randomUUID(),
        hostedBy: userId,
      })
      .returning();
    if (!inserted) {
      return { data: null, error: "Failed to create event." };
    }
    return { data: inserted, error: null };
  } catch (err) {
    console.error("createEvent error:", err);
    return {
      data: null,
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
