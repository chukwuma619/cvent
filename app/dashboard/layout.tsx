import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Compass,
  User,
} from "lucide-react";
import { auth } from "@/lib/auth";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

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
              href="/dashboard"
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              Dashboard
            </Link>
            <span className="text-sm text-muted-foreground">
              {session.user.name ?? session.user.email}
            </span>
            <form action="/api/auth/sign-out" method="POST">
              <button
                type="submit"
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-6">
        <aside className="mb-8 flex flex-wrap items-center gap-2 border-b border-border pb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground underline-offset-4 hover:bg-muted hover:underline"
          >
            <LayoutDashboard className="size-4" />
            My events
          </Link>
          <Link
            href="/dashboard/tickets"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:bg-muted hover:text-foreground hover:underline"
          >
            <Ticket className="size-4" />
            My tickets
          </Link>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:bg-muted hover:text-foreground hover:underline"
          >
            <PlusCircle className="size-4" />
            Create event
          </Link>
          <Link
            href="/dashboard/account"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:bg-muted hover:text-foreground hover:underline"
          >
            <User className="size-4" />
            Account
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:bg-muted hover:text-foreground hover:underline"
          >
            <Compass className="size-4" />
            Discover
          </Link>
        </aside>

        {children}
      </div>
    </div>
  );
}
