import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionFromHeaders } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardAside } from "@/components/dashboard/dashboard-aside";

function truncateAddress(addr: string): string {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 7)}...${addr.slice(-4)}`;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromHeaders(await headers());
  if (!session?.walletAddress) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const userName = truncateAddress(session.walletAddress);
  const walletAddress = session.walletAddress;

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground no-underline sm:text-xl"
          >
            cvent
          </Link>
          <DashboardHeader userName={userName} walletAddress={walletAddress} />
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-4 pb-24 md:py-6 md:pb-6">
        <DashboardAside />
        {children}
      </div>
    </div>
  );
}
