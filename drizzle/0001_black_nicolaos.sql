ALTER TABLE "event_attendees" RENAME TO "event_ticket";--> statement-breakpoint
ALTER TABLE "event_ticket" DROP CONSTRAINT "event_attendees_ticket_code_unique";--> statement-breakpoint
ALTER TABLE "event_ticket" DROP CONSTRAINT "event_attendees_event_id_event_id_fk";
--> statement-breakpoint
ALTER TABLE "event_ticket" DROP CONSTRAINT "event_attendees_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "event_ticket" DROP CONSTRAINT "event_attendees_order_id_event_order_id_fk";
--> statement-breakpoint
ALTER TABLE "event_ticket" DROP CONSTRAINT "event_attendees_event_order_id_event_order_id_fk";
--> statement-breakpoint
DROP INDEX "event_attendees_eventId_userId_idx";--> statement-breakpoint
DROP INDEX "event_attendees_eventOrderId_idx";--> statement-breakpoint
DROP INDEX "event_attendees_ticketCode_idx";--> statement-breakpoint
ALTER TABLE "event_ticket" ADD CONSTRAINT "event_ticket_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_ticket" ADD CONSTRAINT "event_ticket_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_ticket" ADD CONSTRAINT "event_ticket_order_id_event_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."event_order"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_ticket" ADD CONSTRAINT "event_ticket_event_order_id_event_order_id_fk" FOREIGN KEY ("event_order_id") REFERENCES "public"."event_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_ticket_eventId_userId_idx" ON "event_ticket" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "event_ticket_eventOrderId_idx" ON "event_ticket" USING btree ("event_order_id");--> statement-breakpoint
CREATE INDEX "event_ticket_ticketCode_idx" ON "event_ticket" USING btree ("ticket_code");--> statement-breakpoint
ALTER TABLE "event_ticket" ADD CONSTRAINT "event_ticket_ticket_code_unique" UNIQUE("ticket_code");