"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut } from "@/lib/account/actions";
import { Wallet, LogOut } from "lucide-react";

function truncateAddress(addr: string): string {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 7)}...${addr.slice(-4)}`;
}

export function WalletSection({
  walletAddress,
}: {
  walletAddress: string | null | undefined;
}) {
  if (!walletAddress) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-4" />
          Connected wallet
        </CardTitle>
        <CardDescription>
          You are signed in with this CKB wallet address.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <p
            className="font-mono text-sm text-muted-foreground max-w-[280px] truncate"
            title={walletAddress}
          >
            {truncateAddress(walletAddress)}
          </p>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
