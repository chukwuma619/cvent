"use server";

import { getSessionFromHeaders, clearSessionCookie } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut() {
  await clearSessionCookie();
  redirect("/");
}

export async function getSessionWallet(): Promise<{ walletAddress: string | null }> {
  const session = await getSessionFromHeaders(await headers());
  return { walletAddress: session?.walletAddress ?? null };
}
