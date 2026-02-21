import {
  pgTable,
  text,
  timestamp,
  index,
  integer,
  bigint,
} from "drizzle-orm/pg-core";

export const category = pgTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
export type Category = typeof category.$inferSelect;

export const event = pgTable(
  "event",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    date: text("date").notNull(),
    time: text("time").notNull(),
    address: text("address").notNull(),
    imageUrl: text("image_url"),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "restrict" }),
    city: text("city").notNull(),
    continent: text("continent").notNull(),
    description: text("description").notNull(),
    priceCents: integer("price_cents").notNull().default(0),
    currency: text("currency").notNull().default("USD"),
    hostedByWallet: text("hosted_by_wallet").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("event_categoryId_idx").on(table.categoryId),
    index("event_hostedByWallet_idx").on(table.hostedByWallet),
  ]
);
export type Event = typeof event.$inferSelect;

export const eventOrder = pgTable(
  "event_order",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    walletAddress: text("wallet_address").notNull(),
    amountCkbShannons: bigint("amount_ckb_shannons", { mode: "number" }).notNull(),
    status: text("status").notNull(),
    txHash: text("tx_hash"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("event_order_eventId_idx").on(table.eventId),
    index("event_order_walletAddress_idx").on(table.walletAddress),
    index("event_order_status_idx").on(table.status),
  ]
);
export type EventOrder = typeof eventOrder.$inferSelect;

export const eventTicket = pgTable(
  "event_ticket",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    walletAddress: text("wallet_address").notNull(),
    orderId: text("order_id").references(() => eventOrder.id, { onDelete: "set null" }),
    eventOrderId: text("event_order_id")
      .notNull()
      .references(() => eventOrder.id, { onDelete: "cascade" }),
    ticketCode: text("ticket_code").notNull().unique(),
    checkedInAt: timestamp("checked_in_at"),
    ticketEmailSentAt: timestamp("ticket_email_sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("event_ticket_eventId_walletAddress_idx").on(table.eventId, table.walletAddress),
    index("event_ticket_eventOrderId_idx").on(table.eventOrderId),
    index("event_ticket_ticketCode_idx").on(table.ticketCode),
  ]
);
export type EventTicket = typeof eventTicket.$inferSelect;
