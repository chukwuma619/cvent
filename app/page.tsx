import Link from "next/link";
import { Calendar, QrCode, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-foreground no-underline"
          >
            cvent
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/discover"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Discover
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Events with proof of attendance on CKB
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Discover CKB community events, check in at the door or online, and
            receive verifiable proof-of-attendance credentials for bounties,
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
              <Link href="/signup">Create account</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-muted/30">
          <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground">
              How it works
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
              One place to discover events, check in, and get verifiable proof.
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-background">
                  <Calendar className="size-6 text-primary" />
                </div>
                <h3 className="mt-4 font-medium text-foreground">
                  Discover events
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Browse CKB community meetups, workshops, conferences, and
                  more. Filter by category and find events near you.
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
                  Scan a QR code or enter a check-in code at the event. Optional
                  offline check-in for low-connectivity venues.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-background">
                  <ShieldCheck className="size-6 text-primary" />
                </div>
                <h3 className="mt-4 font-medium text-foreground">
                  Verifiable proof
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Receive a signed proof-of-attendance credential. Use it for
                  bounties, DAO roles, and reputation—verifiable by third
                  parties.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto max-w-4xl px-4 py-16 sm:py-20">
          <div className="rounded-lg border border-border bg-card px-6 py-12 text-center shadow-sm sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Ready to explore?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Browse events or create an account to check in and collect proof
              of attendance.
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
                href="/login"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
