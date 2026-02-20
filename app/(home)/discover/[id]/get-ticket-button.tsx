"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCcc } from "@ckb-ccc/connector-react";
import { ccc } from "@ckb-ccc/core";
import { Button } from "@/components/ui/button";
import { registerForEvent, confirmPaidRegistration } from "@/lib/discover/actions";
import { toast } from "sonner";

const SHANNONS_PER_CKB = 100_000_000;
const CKB_PRICE_POLL_MS = 60_000;
const CONFIRM_POLL_MS = 8_000;
const CONFIRM_POLL_ATTEMPTS = 15;

function formatPrice(priceCents: number, currency: string): string {
  const value = priceCents / 100;
  return `${value.toFixed(2)} ${currency}`;
}

type PendingPayment = { txHash: string; amountCkbShannons: number };

type Props = {
  eventId: string;
  priceCents: number;
  currency: string;
  isLoggedIn: boolean;
  hostWalletAddress: string | null;
  hasTicket?: boolean;
  pendingPayment?: PendingPayment;
};

export function GetTicketButton({
  eventId,
  priceCents,
  currency,
  isLoggedIn,
  hostWalletAddress,
  hasTicket = false,
  pendingPayment,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [ckbPrice, setCkbPrice] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingPayment | null>(
    () => pendingPayment ?? null
  );
  const [polling, setPolling] = useState(false);
  const pollCountRef = useRef(0);
  const { open: openWalletModal, signerInfo, client } = useCcc();

  // When server reports a pending payment (e.g. after page refresh), sync client state so we show "Transaction submitted" and poll.
  useEffect(() => {
    if (pendingPayment && !pendingConfirmation) {
      setPendingConfirmation(pendingPayment);
    }
  }, [pendingPayment, pendingConfirmation]);

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

  const tryConfirm = useCallback(
    async (txHash: string, amountCkbShannons: number) => {
      const result = await confirmPaidRegistration(
        eventId,
        txHash,
        amountCkbShannons
      );
      if (result.success && "ticketCode" in result) {
        toast.success("Ticket confirmed!");
        router.push("/dashboard/tickets");
        router.refresh();
        setPendingConfirmation(null);
        setPolling(false);
        return true;
      }
      return false;
    },
    [eventId, router]
  );

  useEffect(() => {
    if (!pendingConfirmation || polling) return;
    const { txHash, amountCkbShannons } = pendingConfirmation;
    setPolling(true);
    pollCountRef.current = 0;
    const interval = setInterval(async () => {
      pollCountRef.current += 1;
      const done = await tryConfirm(txHash, amountCkbShannons);
      if (done || pollCountRef.current >= CONFIRM_POLL_ATTEMPTS) {
        clearInterval(interval);
        setPolling(false);
        if (!done && pollCountRef.current >= CONFIRM_POLL_ATTEMPTS) {
          toast.info(
            "Still confirming. You can retry below or check the explorer later."
          );
        }
      }
    }, CONFIRM_POLL_MS);
    return () => clearInterval(interval);
  }, [pendingConfirmation, polling, tryConfirm]);

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

  if (hasTicket) {
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">You have a ticket</p>
          <p className="mt-1">View and manage your tickets in the dashboard.</p>
        </div>
        <Button size="lg" className="w-full" asChild>
          <Link href="/dashboard/tickets">View my tickets</Link>
        </Button>
      </div>
    );
  }

  if (priceCents > 0) {
    const hasWallet = !!hostWalletAddress;
    const canPay = hasWallet && signerInfo?.signer && amountCkbShannons > 0;

    if (pendingConfirmation) {
      return (
        <div className="space-y-3">
          <div className="rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Transaction submitted</p>
            <p className="mt-1">
              It may take 1–2 minutes to confirm on-chain. We&apos;re checking automatically—you can also click Retry below.
            </p>
          </div>
          <Button
            size="lg"
            className="w-full"
            disabled={polling}
            onClick={async () => {
              const ok = await tryConfirm(
                pendingConfirmation.txHash,
                pendingConfirmation.amountCkbShannons
              );
              if (!ok) {
                toast.error("Still not confirmed. Wait a bit and try again.");
              }
            }}
          >
            {polling ? "Checking…" : "Retry confirmation"}
          </Button>
        </div>
      );
    }

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
              if (result.success && "ticketCode" in result) {
                toast.success("Ticket confirmed!");
                router.push("/dashboard/tickets");
                router.refresh();
              } else if (result.success && result.pendingVerification) {
                setPendingConfirmation({ txHash, amountCkbShannons });
                toast.info("Payment recorded. Waiting for on-chain confirmation…");
              } else if (!result.success) {
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
