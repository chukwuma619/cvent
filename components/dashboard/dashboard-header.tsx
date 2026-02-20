"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, Wallet } from "lucide-react";
import { useCcc } from "@ckb-ccc/connector-react";
import { ccc } from "@ckb-ccc/core";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { signOut } from "@/lib/account/actions";

const SHANNONS_PER_CKB = 100_000_000;

function truncateAddress(addr: string): string {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 7)}...${addr.slice(-4)}`;
}

type DashboardHeaderProps = {
  userName: string | null;
  walletAddress?: string | null;
};

export function DashboardHeader({ userName, walletAddress = null }: DashboardHeaderProps) {
  const [open, setOpen] = useState(false);
  const [liveAddress, setLiveAddress] = useState<string | null>(null);
  const [balanceShannons, setBalanceShannons] = useState<bigint | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const { signerInfo, wallet, client } = useCcc();

  const displayAddress = liveAddress ?? walletAddress ?? null;

  useEffect(() => {
    const signer = signerInfo?.signer;
    if (!signer || !wallet) return;
    const s = signer as unknown as {
      getRecommendedAddress?: () => Promise<string>;
      getAddress?: () => Promise<string>;
    };
    (typeof s.getRecommendedAddress === "function"
      ? s.getRecommendedAddress()
      : typeof s.getAddress === "function"
        ? s.getAddress()
        : Promise.resolve(null)
    ).then((addr) => addr && setLiveAddress(addr));
  }, [signerInfo, wallet]);

  useEffect(() => {
    if (!displayAddress || !client) {
      setBalanceShannons(null);
      return;
    }
    let cancelled = false;
    setBalanceLoading(true);
    (async () => {
      try {
        const ckbClient = client as {
          getBalance?: (scripts: unknown[]) => Promise<bigint>;
        };
        if (typeof ckbClient.getBalance !== "function") {
          if (!cancelled) setBalanceLoading(false);
          return;
        }
        const addr = await ccc.Address.fromString(
          displayAddress,
          client as Parameters<typeof ccc.Address.fromString>[1]
        );
        const balance = await ckbClient.getBalance([addr.script]);
        if (!cancelled) {
          setBalanceShannons(balance);
        }
      } catch {
        if (!cancelled) setBalanceShannons(null);
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [displayAddress, client]);

  return (
    <>
      {/* Desktop nav: visible from md up */}
      <nav className="hidden items-center gap-3 md:flex md:gap-4">
        {displayAddress && (
          <>
            {balanceLoading ? (
              <span className="text-sm text-muted-foreground">…</span>
            ) : balanceShannons != null ? (
              <span className="text-sm font-bold tabular-nums text-foreground">
                {(Number(balanceShannons) / SHANNONS_PER_CKB).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}{" "}
                CKB
              </span>
            ) : null}
            <span
              className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/80 px-3 py-1.5 text-sm font-semibold text-foreground"
              title={displayAddress}
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-background">
                <Wallet className="size-3.5 text-emerald-500" />
              </span>
              {truncateAddress(displayAddress)}
            </span>
          </>
        )}

        <form action={signOut}>
          <button
            type="submit"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Log out
          </button>
        </form>
      </nav>

      {/* Mobile: hamburger + sheet */}
      <div className="flex md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(85vw,280px)]">
            <SheetHeader>
              <SheetTitle className="sr-only">Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-1">
              <Link
                href="/discover"
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Discover
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <div className="my-2 border-t border-border" />
              {displayAddress && (
                <div className="flex flex-col gap-1 px-3 py-2">
                  {!balanceLoading && balanceShannons != null && (
                    <p className="text-sm font-bold tabular-nums text-foreground">
                      {(Number(balanceShannons) / SHANNONS_PER_CKB).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}{" "}
                      CKB
                    </p>
                  )}
                  <p
                    className="font-mono text-xs text-muted-foreground truncate"
                    title={displayAddress}
                  >
                    {displayAddress}
                  </p>
                </div>
              )}
              <div className="my-2 border-t border-border" />

              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  Log out
                </button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
