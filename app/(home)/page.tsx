import Link from "next/link";
import {
  Calendar,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Wallet,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main>
        {/* Hero */}
        <section className="container mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Event ticketing and proof of attendance on CKB
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Discover events, register free or pay in CKB, check in at the door
            with a ticket or QR code, and get a signed credential for bounties,
            DAOs, and reputation.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/discover">
                Discover events
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign in with wallet</Link>
            </Button>
          </div>
        </section>

        {/* Attendees */}
        <section className="border-t border-border bg-muted/30">
          <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground">
              For attendees
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
              Discover events, get tickets, check in, and collect verifiable
              proof.
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-background">
                  <Calendar className="size-6 text-primary" />
                </div>
                <h3 className="mt-4 font-medium text-foreground">
                  Discover events
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Browse meetups, workshops, and conferences. Filter by category
                  and find events near you.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-background">
                  <Ticket className="size-6 text-primary" />
                </div>
                <h3 className="mt-4 font-medium text-foreground">
                  Get tickets
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Register for free or pay in CKB. Your ticket includes a unique
                  code and QR to show at the door.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-background">
                  <QrCode className="size-6 text-primary" />
                </div>
                <h3 className="mt-4 font-medium text-foreground">
                  Check in
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Organizers scan your QR or enter your code at the door so your
                  attendance is recorded.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-background">
                  <ShieldCheck className="size-6 text-primary" />
                </div>
                <h3 className="mt-4 font-medium text-foreground">
                  Get proof
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  After check-in, download a signed proof-of-attendance
                  credential for bounties, DAO roles, and reputation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Organizers */}
        <section className="border-t border-border">
          <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground">
              For organizers
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
              Create events, sell tickets in CKB, check in attendees, and track
              earnings.
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-background">
                  <Calendar className="size-6 text-primary" />
                </div>
                <h3 className="mt-4 font-medium text-foreground">
                  Create events
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Publish free or paid events with title, date, location, and
                  image. Set a price in CKB and receive payouts to your wallet.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-background">
                  <QrCode className="size-6 text-primary" />
                </div>
                <h3 className="mt-4 font-medium text-foreground">
                  Check in
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use ticket code or QR scan at the door to mark attendees as
                  checked in. View the attendee list in your dashboard.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-background">
                  <Wallet className="size-6 text-primary" />
                </div>
                <h3 className="mt-4 font-medium text-foreground">
                  Earnings
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  See paid registrations, total CKB earned, and links to
                  on-chain transactions. Optional on-chain verification.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto max-w-4xl px-4 py-16 sm:py-20">
          <div className="rounded-lg border border-border bg-card px-6 py-12 text-center shadow-sm sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Get started
            </h2>
            <p className="mt-2 text-muted-foreground">
              Discover events or create an account to host events, get tickets,
              and collect proof of attendance.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/discover">
                  Discover events
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
            <Link
              href="/"
              className="text-sm font-medium text-foreground no-underline"
            >
              cvent
            </Link>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link
                href="/discover"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                Discover
              </Link>
                <Link
                  href="https://github.com/chukwuma619/cvent"
                  className="underline-offset-4 hover:text-foreground hover:underline"
                >
                  GitHub
                </Link>

            </div>
          </div>
        </footer>
      </main>
  );
}
