"use client";

import { useState, useEffect, useRef } from "react";
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
import { updateWalletAddress } from "@/lib/account/actions";
import { Spinner } from "@/components/ui/spinner";
import { Wallet, Unplug } from "lucide-react";


export function WalletSection({ walletAddress }: { walletAddress: string | null | undefined }) {
  const router = useRouter();
  const [liveAddress, setLiveAddress] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const syncedRef = useRef<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const { open: openWalletModal, disconnect: disconnectWallet, signerInfo, wallet } = useCcc();

  const displayAddress = liveAddress ?? walletAddress;

  async function handleRemoveWallet() {
    if (!displayAddress) return;
    setRemoving(true);
    setMessage(null);
    const result = await updateWalletAddress(null);
    if (result.success) {
      setLiveAddress(null);
      syncedRef.current = null;
      disconnectWallet();
      setMessage({ type: "success", text: "Wallet removed." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error ?? "Could not remove wallet." });
    }
    setRemoving(false);
  }

  // Auto-sync: when user connects via CCC, get address from signer and save to DB
  useEffect(() => {
    const signer = signerInfo?.signer;
    if (!signer || !wallet) return;

    const syncAddress = async () => {
      try {
        const s = signer as unknown as { getAddress?: () => Promise<string> };
        if (typeof s.getAddress !== "function") return;
        const addr = await s.getAddress();
        if (!addr || addr === syncedRef.current) return;
        syncedRef.current = addr;
        setLiveAddress(addr);
        const result = await updateWalletAddress(addr);
        if (result.success) {
          setMessage({ type: "success", text: "Wallet connected and saved." });
          router.refresh();
        } else {
          setMessage({
            type: "error",
            text: result.error ?? "Could not save wallet.",
          });
        }
      } catch {
        setMessage({
          type: "error",
          text: "Could not read address from wallet.",
        });
      }
    };

    syncAddress();
  }, [signerInfo, wallet, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-4" />
          Wallet
        </CardTitle>
        <CardDescription>
          Connect your CKB wallet to link it to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={openWalletModal}>
            Connect wallet
          </Button>
          {displayAddress && (
            <>
              <p
                className="font-mono text-muted-foreground text-sm max-w-[280px] truncate"
                title={displayAddress}
              >
                {displayAddress}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveWallet}
                disabled={removing}
                className="text-muted-foreground hover:text-destructive"
              >
                {removing ? (
                  <Spinner className="size-4" />
                ) : (
                  <>
                    <Unplug className="size-4" />
                    Remove
                  </>
                )}
              </Button>
            </>
          )}
        </div>
        {message && (
          <p
            className={
              message.type === "success"
                ? "text-sm text-green-600 dark:text-green-400"
                : "text-sm text-red-600 dark:text-red-400"
            }
          >
            {message.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
