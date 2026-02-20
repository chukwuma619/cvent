"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCcc } from "@ckb-ccc/connector-react";
import { ccc } from "@ckb-ccc/core";
import { Button } from "@/components/ui/button";
import { registerForEvent, confirmPaidRegistration } from "@/lib/discover/actions";
import { toast } from "sonner";

const SHANNONS_PER_CKB = 100_000_000;
const CKB_PRICE_POLL_MS = 60_000;

function formatPrice(priceCents: number, currency: string): string {
  const value = priceCents / 100;
  return `${value.toFixed(2)} ${currency}`;
}

type Props = {
  eventId: string;
  priceCents: number;
  currency: string;
  isLoggedIn: boolean;
  hostWalletAddress: string | null;
};

export function GetTicketButton({
  eventId,
  priceCents,
  currency,
  isLoggedIn,
  hostWalletAddress,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [ckbPrice, setCkbPrice] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const { open: openWalletModal, signerInfo, client } = useCcc();

  const fetchCkbPrice = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/ckb-price?currency=${encodeURIComponent(currency)}`
      );
      if (!res.ok) throw new Error("Failed to fetch CKB price");
      const data = (await res.json()) as { price: number };
      if (typeof data.price !== "number" || data.price <= 0) {
        throw new Error("Invalid CKB price");
      }
      setCkbPrice(data.price);
      setPriceError(null);
    } catch {
      setPriceError("Price unavailable");
    }
  }, [currency]);

  useEffect(() => {
    if (priceCents <= 0) return;
    fetchCkbPrice();
    const id = setInterval(fetchCkbPrice, CKB_PRICE_POLL_MS);
    return () => clearInterval(id);
  }, [priceCents, fetchCkbPrice]);

  const amountCkbShannons =
    ckbPrice != null && ckbPrice > 0
      ? Math.ceil((priceCents / 100) / ckbPrice * SHANNONS_PER_CKB)
      : 0;
  const amountCkb = amountCkbShannons / SHANNONS_PER_CKB;

  if (!isLoggedIn) {
    return (
      <Button size="lg" className="w-full" asChild>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/discover/${eventId}`)}`}
        >
          Get ticket
        </Link>
      </Button>
    );
  }

  if (priceCents > 0) {
    const hasWallet = !!hostWalletAddress;
    const canPay = hasWallet && signerInfo?.signer && amountCkbShannons > 0;

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-2 text-sm text-muted-foreground">
          <span>{formatPrice(priceCents, currency)}</span>
          {ckbPrice != null && !priceError && (
            <span>≈ {amountCkb.toFixed(4)} CKB</span>
          )}
          {priceError && <span className="text-destructive">{priceError}</span>}
        </div>
        {!hasWallet && (
          <p className="text-xs text-muted-foreground">
            Host has not set a wallet address; payment is unavailable.
          </p>
        )}
        <Button
          size="lg"
          className="w-full"
          disabled={!canPay || pending}
          onClick={async () => {
            if (!canPay || !hostWalletAddress || !signerInfo?.signer || !client) {
              if (!signerInfo?.signer) {
                openWalletModal();
                return;
              }
              return;
            }
            setPending(true);
            try {
              const signer = signerInfo.signer as {
                client?: unknown;
                sendTransaction?: (tx: unknown) => Promise<string>;
              };
              const ckbClient = signer.client ?? client;
              const lock = await ccc.Address.fromString(
                hostWalletAddress,
                ckbClient as Parameters<typeof ccc.Address.fromString>[1]
              );
              const tx = ccc.Transaction.from({
                outputs: [
                  {
                    lock: lock.script,
                    capacity: ccc.fixedPointFrom(amountCkb),
                  },
                ],
              });
              await tx.completeInputsByCapacity(signer as never);
              await tx.completeFeeBy(signer as never);
              const txHash = await (signer.sendTransaction as (tx: unknown) => Promise<string>)(tx);
              const result = await confirmPaidRegistration(
                eventId,
                txHash,
                amountCkbShannons
              );
              if (result.success) {
                toast.success("Ticket confirmed!");
                router.push("/dashboard/tickets");
                router.refresh();
              } else {
                toast.error(result.error);
              }
            } catch (err) {
              const msg = err instanceof Error ? err.message : "Payment failed";
              toast.error(msg);
            } finally {
              setPending(false);
            }
          }}
        >
          {!signerInfo?.signer
            ? "Connect wallet to pay"
            : pending
              ? "Paying…"
              : "Pay with CKB"}
        </Button>
      </div>
    );
  }

  async function handleGetTicket() {
    setPending(true);
    try {
      const result = await registerForEvent(eventId);
      if (result.success) {
        toast.success("Ticket added!");
        router.push("/dashboard/tickets");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleGetTicket}
      disabled={pending}
    >
      {pending ? "Getting ticket…" : "Get ticket"}
    </Button>
  );
}
