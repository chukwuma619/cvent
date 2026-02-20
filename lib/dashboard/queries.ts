import { asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  event,
  category,
  user,
  eventOrder,
  eventTicket,
  type Event,
} from "@/lib/db/schema";

export type CategoryOption = { id: string; name: string };

export type CategoryWithDisplay = CategoryOption & {
  description: string | null;
  icon: string;
  color: string;
};

export async function getCategories() {
  try {
    const rows = await db
      .select({ id: category.id, name: category.name })
      .from(category);
    return { data: rows , error: null };
  } catch (err) {
    console.error("getCategories error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Failed to get categories." };
  }
}

export async function getCategoryById(categoryId: string): Promise<{ data: CategoryWithDisplay | null, error: string | null }> {
  try {
    const row = await db
      .select({ id: category.id, name: category.name, description: category.description, icon: category.icon, color: category.color })
      .from(category)
      .where(eq(category.id, categoryId));
    return { data: row[0] ?? null, error: null };
  } catch (err) {
    console.error("getCategoryById error:", err);
    return { data: null, error: err instanceof Error ? err.message : "Failed to get category by id." };
  }
}

export async function getCategoriesWithDisplay(): Promise<{ data: CategoryWithDisplay[], error: string | null }> {
  try {
    const rows = await db
      .select({
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
      })
      .from(category);
    return { data: rows , error: null };
  } catch (err) {
    console.error("getCategoriesWithDisplay error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Failed to get categories with display." };
  }
}

export async function getAllEvents() {
  try {
    const eventData = await db.select().from(event);
    return { data: eventData, error: null };
  } catch (err) {
    console.error("getAllEvents error:", err);
    return {
      data: [],
      error: err instanceof Error ? err.message : "Failed to get all events.",
    };
  }
}

export async function getAllEventsByCategoryId(categoryId: string): Promise<{ data: Event[], error: string | null }> {

  try {
    const eventData = await db.select().from(event).where(eq(event.categoryId, categoryId));
    return { data: eventData as Event[], error: null };
  } catch (err) {
    console.error("getAllEventsByCategoryId error:", err);
    return { data: [] as Event[], error: err instanceof Error ? err.message : "Failed to get all events by category id." };
  }
}
export async function getEvent(eventId: string) {
  try {
    const eventData = await db
      .select(
        {
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          priceCents: event.priceCents,
          currency: event.currency,
          address: event.address,
          imageUrl: event.imageUrl,
          categoryName: category.name,
          hostedByName: user.name,
          hostedByWalletAddress: user.walletAddress,
        }
      )
      .from(event)
      .innerJoin(category, eq(event.categoryId, category.id))
      .innerJoin(user, eq(event.hostedBy, user.id))
      .where(eq(event.id, eventId));
    return { data:eventData[0], error: null };
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
      .select({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        address: event.address,
        imageUrl: event.imageUrl,
        categoryName: category.name,
      })
      .from(event)
      .innerJoin(category, eq(event.categoryId, category.id))
      .where(eq(event.hostedBy, userId));
    return { data: eventData, error: null };
  } catch (err) {
    console.error("getEventsCreatedByUser error:", err);
    return {
      data: [],
      error: err instanceof Error ? err.message : "Failed to get user events.",
    };
  }
}

export type OrderForHost = {
  orderId: string;
  eventId: string;
  eventTitle: string;
  amountCkbShannons: number;
  txHash: string | null;
  orderCreatedAt: Date;
  buyerName: string;
};

export async function getOrdersForHost(
  hostUserId: string
): Promise<{ data: OrderForHost[]; error: string | null }> {
  try {
    const rows = await db
      .select({
        orderId: eventOrder.id,
        eventId: event.id,
        eventTitle: event.title,
        amountCkbShannons: eventOrder.amountCkbShannons,
        txHash: eventOrder.txHash,
        orderCreatedAt: eventOrder.createdAt,
        buyerName: user.name,
      })
      .from(eventOrder)
      .innerJoin(event, eq(eventOrder.eventId, event.id))
      .innerJoin(user, eq(eventOrder.userId, user.id))
      .where(eq(event.hostedBy, hostUserId))
      .orderBy(desc(eventOrder.createdAt));
    return { data: rows, error: null };
  } catch (err) {
    console.error("getOrdersForHost error:", err);
    return {
      data: [],
      error: err instanceof Error ? err.message : "Failed to get orders.",
    };
  }
}

export async function getEventDetails(eventId: string) {
  try {
    const [row] = await db
      .select({
        id: event.id,
        hostedBy: event.hostedBy,
        title: event.title,
        date: event.date,
        time: event.time,
        address: event.address,
        imageUrl: event.imageUrl,
        city: event.city,
        continent: event.continent,
        description: event.description,
        priceCents: event.priceCents,
        currency: event.currency,
        categoryId: event.categoryId,
        categoryName: category.name,
        hostedByName: user.name,
      })
      .from(event)
      .innerJoin(category, eq(event.categoryId, category.id))
      .innerJoin(user, eq(event.hostedBy, user.id))
      .where(eq(event.id, eventId))
      .limit(1);
    return { data: row, error: null };
  } catch (err) {
    console.error("getEventDetails error:", err);
    return {
      data: null,
      error:
        err instanceof Error ? err.message : "Failed to get event details.",
    };
  }
}

export type EventForEdit = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  address: string;
  imageUrl: string | null;
  categoryId: string;
  city: string;
  continent: string;
  priceCents: number;
  currency: string;
};

export async function getEventForEdit(
  eventId: string,
  userId: string
): Promise<{ data: EventForEdit | null; error: string | null }> {
  try {
    const [row] = await db
      .select({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        address: event.address,
        imageUrl: event.imageUrl,
        categoryId: event.categoryId,
        city: event.city,
        continent: event.continent,
        priceCents: event.priceCents,
        currency: event.currency,
        hostedBy: event.hostedBy,
      })
      .from(event)
      .where(eq(event.id, eventId))
      .limit(1);
    if (!row || row.hostedBy !== userId) {
      return { data: null, error: null };
    }
    return {
      data: {
        id: row.id,
        title: row.title,
        description: row.description,
        date: row.date,
        time: row.time,
        address: row.address,
        imageUrl: row.imageUrl,
        categoryId: row.categoryId,
        city: row.city,
        continent: row.continent,
        priceCents: row.priceCents,
        currency: row.currency,
      },
      error: null,
    };
  } catch (err) {
    console.error("getEventForEdit error:", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to get event.",
    };
  }
}



export async function getAttendeesCountByEventId(
  eventId: string
): Promise<{ data: number, error: string | null }> {
  try {
    const [row] = await db
      .select({ count: count() })
        .from(eventTicket)
      .where(eq(eventTicket.eventId, eventId));
    return { data: row.count, error: null };
  } catch (err) {
    console.error("getAttendeesCountByEventId error:", err);
    return { data: 0, error: err instanceof Error ? err.message : "Failed to get attendees count." };
  }
}

export type EventAttendeeWithUser = {
  id: string;
  userName: string;
  userEmail: string;
  ticketCode: string;
  checkedInAt: Date | null;
};

export async function getAttendeesByEventId(
  eventId: string
): Promise<{ data: EventAttendeeWithUser[]; error: string | null }> {
  try {
    const rows = await db
      .select({
        id: eventTicket.id,
        userName: user.name,
        userEmail: user.email,
        ticketCode: eventTicket.ticketCode,
        checkedInAt: eventTicket.checkedInAt,
      })
      .from(eventTicket)
      .innerJoin(user, eq(eventTicket.userId, user.id))
      .where(eq(eventTicket.eventId, eventId))
      .orderBy(asc(eventTicket.createdAt));
    return { data: rows, error: null };
  } catch (err) {
    console.error("getAttendeesByEventId error:", err);
    return {
      data: [],
      error: err instanceof Error ? err.message : "Failed to get attendees.",
    };
  }
}

export type TicketWithEvent = {
  event: Event;
  ticketCode: string;
  orderStatus: string;
};

export async function getTicketsByUserId(
  userId: string
): Promise<{ data: TicketWithEvent[], error: string | null }> {
  try {
    const rows = await db
      .select({
        event: event,
        eventOrder: eventOrder,
        ticketCode: eventTicket.ticketCode,
        orderStatus: eventOrder.status,
      })
      .from(eventTicket)
      .innerJoin(event, eq(eventTicket.eventId, event.id))
        .innerJoin(eventOrder, eq(eventTicket.eventOrderId, eventOrder.id))
      .where(eq(eventTicket.userId, userId));
    return { data: rows, error: null };
  } catch (err) {
    console.error("getTicketsByUserId error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Failed to get tickets." };
  }
}

