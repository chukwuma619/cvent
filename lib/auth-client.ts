"use client";

import { useCallback, useEffect, useState } from "react";

export type Session = { walletAddress: string } | null;

export function useSession(): {
  data: Session;
  status: "loading" | "authenticated" | "unauthenticated";
} {
  const [data, setData] = useState<Session>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const json = (await res.json()) as { walletAddress: string | null };
      if (json.walletAddress) {
        setData({ walletAddress: json.walletAddress });
        setStatus("authenticated");
      } else {
        setData(null);
        setStatus("unauthenticated");
      }
    } catch {
      setData(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, status };
}

export async function signOutClient(): Promise<void> {
  await fetch("/api/auth/signout", { method: "POST" });
  window.location.href = "/";
}
