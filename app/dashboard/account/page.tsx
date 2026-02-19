import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AccountForm } from "@/components/dashboard/account-form";
import { WalletSection } from "@/components/dashboard/wallet-section";

export default async function DashboardAccountPage() {
  const session = await auth.api.getSession({ 
    headers: await headers() 
  });

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/account");
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Account</h1>
      <AccountForm
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image ?? null,
        }}
      />

      <WalletSection
        walletAddress={session.user.walletAddress}
      />
    </div>
  );
}
