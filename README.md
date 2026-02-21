# cvent

Event ticketing and proof of attendance on [CKB](https://nervos.org/) (Nervos). Discover events, register free or pay in CKB, check in at the door with a ticket or QR code, and get a signed credential for bounties, DAOs, and reputation.

## Features

**For attendees**

- Discover events by category and location
- Register for free or pay in CKB (Nervos) via wallet
- Receive tickets with unique code and QR
- View and print ticket receipts** (event details, ticket code, QR code)
- Check in at the door (organizer scans QR or enters code)
- Download a signed proof-of-attendance credential (JWT) for bounties, DAO roles, and reputation

**For organizers**

- Create and publish free or paid events (title, date, location, image)
- Set price in CKB; receive payouts to your wallet
- Check in attendees via ticket code or QR scan
- View attendee list and earnings in the dashboard
- Optional on-chain payment verification (manual or cron when on Pro)

## Tech stack

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router), React 19
- **Database:** [Neon](https://neon.tech) (PostgreSQL) with [Drizzle ORM](https://orm.drizzle.team/)
- **Auth:** Wallet-only (CKB wallet sign-in via [@ckb-ccc](https://github.com/ckb-js/ckb-ccc), JWT session)
- **Payments:** CKB (Nervos) via [@ckb-ccc](https://github.com/ckb-js/ckb-ccc) (wallet connect, RPC verification)
- **Storage:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for event images
- **UI:** [Tailwind CSS](https://tailwindcss.com/) 4, [shadcn/ui](https://ui.shadcn.com/), [Lucide](https://lucide.dev/) icons
- **Deploy:** Vercel (payment verification via manual trigger or cron on Pro)

## Project structure

```
app/
  (home)/                    # Public: landing, discover, event detail
  (auth)/                    # Login (wallet connect)
  dashboard/                 # Protected: events, tickets, account, earnings, create/edit event
    tickets/
      receipt/[ticketId]/     # Ticket receipt (view/print)
  api/                       # Auth, CKB price, upload, cron, credentials, well-known
lib/
  auth.ts                    # Wallet-signed session (getSession, setSessionCookie)
  auth-client.ts             # useSession hook
  db/                        # Drizzle schema + Neon client
  discover/actions.ts        # Event discovery, registration, CKB payment flow
  dashboard/                 # Dashboard queries and actions (tickets, receipt, check-in)
  account/                   # Account actions
  ckb.ts                     # CKB price, RPC verification helpers
  attendance-credential.ts   # Ed25519 JWT proof-of-attendance
components/                  # UI components (shadcn + app-specific, ticket QR, print receipt)
drizzle/                     # Migrations (generated)
```

## Prerequisites

- Node.js 20+
- pnpm (or npm/yarn/bun)
- Neon (or any PostgreSQL) database
- Optional: CKB RPC (e.g. [ckb.taiko.xyz](https://ckb.taiko.xyz)), Vercel Blob

## Environment variables

Create a `.env` or `.env.local` in the project root.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon/PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | No | App base URL for credentials issuer (e.g. `https://yourapp.com` or `http://localhost:3000`) |
| `CKB_RPC_URL` | No | CKB JSON-RPC URL for on-chain payment verification and address derivation (e.g. `https://ckb.taiko.xyz`) |
| `CRON_SECRET` | No | Secret for protecting `/api/cron/verify-payments` (Vercel Cron sends as `Authorization: Bearer <CRON_SECRET>`) |
| `ATTENDANCE_ISSUER_PRIVATE_KEY` | No | PEM Ed25519 private key for signing proof-of-attendance JWTs; if unset, credential issuance is disabled |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | No | Google Maps API key for address autocomplete when creating events |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token for event image uploads |

## Getting started

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd cvent
   pnpm install
   ```

2. **Set environment variables**

   Copy the variables above into `.env.local` and fill in at least `DATABASE_URL`.

3. **Database**

   Ensure the DB is created in Neon, then run Drizzle migrations (or push schema):

   ```bash
   pnpm drizzle-kit push
   # or generate and run migrations:
   # pnpm drizzle-kit generate
   # pnpm drizzle-kit migrate
   ```

4. **Run the dev server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Use **Discover** to browse events and **Log in** (wallet) to create events or get tickets. Registered users can view and print ticket receipts from **Dashboard → My tickets → View receipt**.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm drizzle-kit push` | Push schema to DB (no migration files) |
| `pnpm drizzle-kit generate` | Generate migrations from schema |
| `pnpm drizzle-kit migrate` | Run pending migrations |
| `pnpm drizzle-kit studio` | Open Drizzle Studio (if configured) |

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/session` | GET | Current wallet session |
| `/api/auth/nonce` | GET | Nonce for wallet sign-in |
| `/api/auth/wallet` | POST | Wallet sign-in (message + signature) |
| `/api/auth/signout` | POST | Sign out |
| `/api/ckb-price` | GET | CKB price in a given currency (query: `currency`) |
| `/api/upload` | POST | Upload event image (Vercel Blob) |
| `/api/credentials/attendance` | GET | Signed proof-of-attendance JWT (query: `eventId`; requires session) |
| `/api/well-known/attendance-issuer` | GET | Issuer id + public key for credential verification (rewritten from `/.well-known/attendance-issuer`) |
| `/api/cron/verify-payments` | GET | Verify pending CKB payments and issue tickets (secured by `CRON_SECRET`; call manually or via cron) |

## Payment verification

Pending paid orders are verified on-chain. **Vercel Hobby** allows only one cron run per day, so the built-in cron is disabled by default.

**For test users and Hobby deployments:**

1. **Dashboard button** — In **Dashboard → Earnings**, use **Verify pending payments** to run verification on demand. Use this after someone has paid for a ticket so their order is confirmed and the ticket is issued.
2. **Manual API call** — From your machine or a script:
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" "https://your-app.vercel.app/api/cron/verify-payments"
   ```
3. **External cron (optional)** — Use a free scheduler (e.g. [cron-job.org](https://cron-job.org)) to call the URL above once per day.

**When you upgrade to Vercel Pro**, you can re-enable the cron in `vercel.json`:

```json
{
  "crons": [{ "path": "/api/cron/verify-payments", "schedule": "*/5 * * * *" }]
}
```

Set `CRON_SECRET` in the project environment and (optionally) `CKB_RPC_URL` for the CKB node used to confirm transactions.

## Proof-of-attendance credentials

After check-in, attendees can request a signed JWT from `GET /api/credentials/attendance?eventId=...`. Verifiers can resolve the issuer and public key from `/.well-known/attendance-issuer`. Set `ATTENDANCE_ISSUER_PRIVATE_KEY` (Ed25519 PEM) to enable signing; otherwise the credential endpoint returns 503.

## Deploy on Vercel

1. Push the repo and import the project in [Vercel](https://vercel.com).
2. Add all required (and desired) environment variables in the project settings.
3. Deploy. Use **Dashboard → Earnings → Verify pending payments** to run payment verification until you enable a cron (e.g. on Vercel Pro).

For more on Next.js deployment, see [Deploying](https://nextjs.org/docs/app/building-your-application/deploying).

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Nervos / CKB](https://docs.nervos.org/)
- [CKB CCC (wallet connect)](https://github.com/ckb-js/ckb-ccc)
