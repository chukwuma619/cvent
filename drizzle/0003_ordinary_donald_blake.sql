ALTER TABLE "account" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verification" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "account" CASCADE;--> statement-breakpoint
DROP TABLE "session" CASCADE;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
DROP TABLE "verification" CASCADE;--> statement-breakpoint
ALTER TABLE "event" RENAME COLUMN "hosted_by" TO "hosted_by_wallet";--> statement-breakpoint
ALTER TABLE "event_order" RENAME COLUMN "user_id" TO "wallet_address";--> statement-breakpoint
ALTER TABLE "event_ticket" RENAME COLUMN "user_id" TO "wallet_address";--> statement-breakpoint
ALTER TABLE "event" DROP CONSTRAINT IF EXISTS "event_hosted_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "event_order" DROP CONSTRAINT IF EXISTS "event_order_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "event_ticket" DROP CONSTRAINT IF EXISTS "event_ticket_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "event_order_userId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "event_ticket_eventId_userId_idx";--> statement-breakpoint
CREATE INDEX "event_hostedByWallet_idx" ON "event" USING btree ("hosted_by_wallet");--> statement-breakpoint
CREATE INDEX "event_order_walletAddress_idx" ON "event_order" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "event_ticket_eventId_walletAddress_idx" ON "event_ticket" USING btree ("event_id","wallet_address");