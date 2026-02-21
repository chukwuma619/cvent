import Link from "next/link";
import { headers } from "next/headers";
import { getSessionFromHeaders } from "@/lib/auth";
export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromHeaders(await headers());

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
          {session?.walletAddress ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>

  {children}
  </div>
  )
}