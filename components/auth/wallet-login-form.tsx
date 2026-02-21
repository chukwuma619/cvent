"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCcc } from "@ckb-ccc/connector-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Wallet } from "lucide-react";
import { toast } from "sonner";

export function WalletLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { open: openWalletModal, signerInfo, wallet } = useCcc();

  async function handleSignIn() {
    if (!signerInfo?.signer || !wallet) {
      openWalletModal();
      return;
    }

    setLoading(true);
    try {
      const signer = signerInfo.signer as {
        getRecommendedAddress?: () => Promise<string>;
        getAddress?: () => Promise<string>;
        signMessage?: (message: string) => Promise<{ signature: string; identity: string; signType: string }>;
      };

      const address = await (typeof signer.getRecommendedAddress === "function"
        ? signer.getRecommendedAddress()
        : typeof signer.getAddress === "function"
          ? signer.getAddress()
          : Promise.resolve(null));

      if (!address) {
        toast.error("Could not get wallet address. Connect your wallet first.");
        setLoading(false);
        return;
      }

      const nonceRes = await fetch("/api/auth/nonce");
      if (!nonceRes.ok) {
        toast.error("Failed to get sign-in challenge.");
        setLoading(false);
        return;
      }
      const { nonce } = (await nonceRes.json()) as { nonce: string };
      if (!nonce) {
        toast.error("Invalid sign-in challenge.");
        setLoading(false);
        return;
      }

      if (typeof signer.signMessage !== "function") {
        toast.error("This wallet does not support message signing.");
        setLoading(false);
        return;
      }

      const sig = await signer.signMessage(nonce);
      const signature =
        typeof sig === "object" && sig !== null && "signature" in sig
          ? JSON.stringify(sig)
          : String(sig);

      const walletRes = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: nonce,
          signature,
          address,
        }),
      });

      if (!walletRes.ok) {
        const data = (await walletRes.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error ?? "Sign-in failed.");
        setLoading(false);
        return;
      }

      toast.success("Signed in successfully.");
      const url = new URL(window.location.href);
      const callbackUrl = url.searchParams.get("callbackUrl") ?? "/dashboard";
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("handleSignIn error:", err);
      toast.error(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  const hasWallet = !!signerInfo?.signer && !!wallet;

  return (
    <Card className="border-border/80 shadow-lg shadow-primary/5">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl">Sign in with wallet</CardTitle>
        <CardDescription>
          Connect your CKB wallet and sign a message to sign in. No email or password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          className="w-full"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <Spinner className="size-4" />
          ) : hasWallet ? (
            "Sign message to sign in"
          ) : (
            <>
              <Wallet className="size-4" />
              Connect wallet & sign in
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
