import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionFromHeaders } from "@/lib/auth";
import { WalletSection } from "@/components/dashboard/wallet-section";

export default async function DashboardAccountPage() {
  const session = await getSessionFromHeaders(await headers());

  if (!session?.walletAddress) {
    redirect("/login?callbackUrl=/dashboard/account");
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Account</h1>
      <WalletSection walletAddress={session.walletAddress} />
    </div>
  );
}
