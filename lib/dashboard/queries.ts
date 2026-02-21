import { and, asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  event,
  category,
  eventOrder,
  eventTicket,
  type Event,
} from "@/lib/db/schema";

function truncateAddress(addr: string): string {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 7)}...${addr.slice(-4)}`;
}

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
          hostedByName: event.hostedByWallet,
          hostedByWalletAddress: event.hostedByWallet,
        }
      )
      .from(event)
      .innerJoin(category, eq(event.categoryId, category.id))
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

export async function getEventsCreatedByUser(walletAddress: string) {
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
      .where(eq(event.hostedByWallet, walletAddress));
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
  hostWalletAddress: string
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
        buyerName: eventOrder.walletAddress,
      })
      .from(eventOrder)
      .innerJoin(event, eq(eventOrder.eventId, event.id))
      .where(eq(event.hostedByWallet, hostWalletAddress))
      .orderBy(desc(eventOrder.createdAt));
    return {
      data: rows.map((r) => ({
        ...r,
        buyerName: truncateAddress(r.buyerName),
      })),
      error: null,
    };
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
        hostedByWallet: event.hostedByWallet,
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
        hostedByName: event.hostedByWallet,
      })
      .from(event)
      .innerJoin(category, eq(event.categoryId, category.id))
      .where(eq(event.id, eventId))
      .limit(1);
    if (!row) return { data: null, error: null };
    return {
      data: {
        ...row,
        hostedByName: truncateAddress(row.hostedByName),
      },
      error: null,
    };
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
  walletAddress: string
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
        hostedByWallet: event.hostedByWallet,
      })
      .from(event)
      .where(eq(event.id, eventId))
      .limit(1);
    if (!row || row.hostedByWallet !== walletAddress) {
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
      error: err instanceof Error ? err.message : "Failed to get event for edit.",
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
        walletAddress: eventTicket.walletAddress,
        ticketCode: eventTicket.ticketCode,
        checkedInAt: eventTicket.checkedInAt,
      })
      .from(eventTicket)
      .where(eq(eventTicket.eventId, eventId))
      .orderBy(asc(eventTicket.createdAt));
    return {
      data: rows.map((r) => ({
        id: r.id,
        userName: truncateAddress(r.walletAddress),
        userEmail: r.walletAddress,
        ticketCode: r.ticketCode,
        checkedInAt: r.checkedInAt,
      })),
      error: null,
    };
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
  checkedInAt: Date | null;
};

export async function getTicketsByUserId(
  walletAddress: string
): Promise<{ data: TicketWithEvent[], error: string | null }> {
  try {
    const rows = await db
      .select({
        event: event,
        eventOrder: eventOrder,
        ticketCode: eventTicket.ticketCode,
        orderStatus: eventOrder.status,
        checkedInAt: eventTicket.checkedInAt,
      })
      .from(eventTicket)
      .innerJoin(event, eq(eventTicket.eventId, event.id))
        .innerJoin(eventOrder, eq(eventTicket.eventOrderId, eventOrder.id))
      .where(eq(eventTicket.walletAddress, walletAddress));
    return { data: rows, error: null };
  } catch (err) {
    console.error("getTicketsByUserId error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Failed to get tickets." };
  }
}

export type AttendedTicketForCredential = {
  eventId: string;
  eventTitle: string;
  checkedInAt: Date;
  userWalletAddress: string | null;
  userId: string;
};

export async function getUserHasTicketForEvent(
  walletAddress: string,
  eventId: string
): Promise<{ data: boolean; error: string | null }> {
  try {
    const [row] = await db
      .select({ id: eventTicket.id })
      .from(eventTicket)
      .where(
        and(
          eq(eventTicket.walletAddress, walletAddress),
          eq(eventTicket.eventId, eventId)
        )
      )
      .limit(1);
    return { data: !!row, error: null };
  } catch (err) {
    console.error("getUserHasTicketForEvent error:", err);
    return {
      data: false,
      error: err instanceof Error ? err.message : "Failed to check ticket.",
    };
  }
}

/** If the user has a paid-event order still pending on-chain verification, return it so the UI can resume polling. */
export async function getUserPendingPaymentForEvent(
  walletAddress: string,
  eventId: string
): Promise<{
  data: { txHash: string; amountCkbShannons: number } | null;
  error: string | null;
}> {
  try {
    const [row] = await db
      .select({
        txHash: eventOrder.txHash,
        amountCkbShannons: eventOrder.amountCkbShannons,
      })
      .from(eventOrder)
      .where(
        and(
          eq(eventOrder.walletAddress, walletAddress),
          eq(eventOrder.eventId, eventId),
          eq(eventOrder.status, "pending_verification")
        )
      )
      .limit(1);
    if (!row?.txHash) return { data: null, error: null };
    return {
      data: {
        txHash: row.txHash,
        amountCkbShannons: row.amountCkbShannons ?? 0,
      },
      error: null,
    };
  } catch (err) {
    console.error("getUserPendingPaymentForEvent error:", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to check pending payment.",
    };
  }
}

export async function getAttendedTicketForUser(
  walletAddress: string,
  eventId: string
): Promise<{ data: AttendedTicketForCredential | null; error: string | null }> {
  try {
    const rows = await db
      .select({
        eventId: event.id,
        eventTitle: event.title,
        checkedInAt: eventTicket.checkedInAt,
        walletAddress: eventTicket.walletAddress,
      })
      .from(eventTicket)
      .innerJoin(event, eq(eventTicket.eventId, event.id))
      .where(
        and(
          eq(eventTicket.walletAddress, walletAddress),
          eq(eventTicket.eventId, eventId)
        )
      )
      .limit(1);
    const row = rows[0];
    if (!row || !row.checkedInAt) {
      return { data: null, error: null };
    }
    return {
      data: {
        eventId: row.eventId,
        eventTitle: row.eventTitle,
        checkedInAt: row.checkedInAt,
        userWalletAddress: row.walletAddress,
        userId: row.walletAddress,
      },
      error: null,
    };
  } catch (err) {
    console.error("getAttendedTicketForUser error:", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to load attendance.",
    };
  }
}
