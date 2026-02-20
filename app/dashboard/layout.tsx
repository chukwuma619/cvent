import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWalletByUserId } from "@/lib/account/actions";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardAside } from "@/components/dashboard/dashboard-aside";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const userName = session.user.name ?? session.user.email ?? null;
  const wallet = await getWalletByUserId(session.user.id);
  const walletAddress = wallet?.address ?? session.user.walletAddress ?? null;

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
