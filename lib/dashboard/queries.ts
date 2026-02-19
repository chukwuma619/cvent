import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { event, category } from "@/lib/db/schema";

export type CategoryOption = { id: string; name: string };

export async function getCategories() {
  try {
    const rows = await db
      .select({ id: category.id, name: category.name })
      .from(category);
    return rows as CategoryOption[];
  } catch (err) {
    console.error("getCategories error:", err);
    return [];
  }
}

export async function getAllEvents() {
  try {
    const eventData = await db.select().from(event);
    return { data: eventData, error: null };
  } catch (err) {
    console.error("getAllEvents error:", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to get all events.",
    };
  }
}

export async function getEvent(eventId: string) {
  try {
    const eventData = await db
      .select()
      .from(event)
      .where(eq(event.id, eventId));
    return { data: eventData[0], error: null };
  } catch (err) {
    console.error("getEvent error:", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to get event.",
    };
  }
}

export async function getEventsCreatedByUser(userId: string) {
  try {
    const eventData = await db
      .select()
      .from(event)
      .where(eq(event.hostedBy, userId));
    return { data: eventData, error: null };
  } catch (err) {
    console.error("getEventsCreatedByUser error:", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to get user events.",
    };
  }
}

export async function getEventDetails(eventId: string) {
  try {
    const eventData = await db
      .select()
      .from(event)
      .where(eq(event.id, eventId));
    return { data: eventData[0], error: null };
  } catch (err) {
    console.error("getEventDetails error:", err);
    return {
      data: null,
      error:
        err instanceof Error ? err.message : "Failed to get event details.",
    };
  }
}

