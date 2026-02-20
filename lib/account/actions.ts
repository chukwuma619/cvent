"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type UpdateProfileInput = {
  name?: string;
  image?: string | null;
};

export async function updateProfile(data: UpdateProfileInput) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false as const, error: "You must be signed in." };
    }

    const updates: { name?: string; image?: string | null } = {};
    if (data.name !== undefined && data.name.trim()) updates.name = data.name.trim();
    if (data.image !== undefined) updates.image = data.image || null;

    if (Object.keys(updates).length === 0) {
      return { success: true as const };
    }

    await db.update(user).set(updates).where(eq(user.id, userId));

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/account");
    return { success: true as const };
  } catch (err) {
    console.error("updateProfile error:", err);
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to update profile.",
    };
  }
}

export async function getWalletByUserId(userId: string) {
  const [row] = await db
    .select({ address: user.walletAddress })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return row ? { address: row.address ?? null } : null;
}

export async function updateWalletAddress(walletAddress: string | null) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false as const, error: "You must be signed in." };
    }

    const value =
      typeof walletAddress === "string" ? walletAddress.trim() || null : null;

    await db
      .update(user)
      .set({ walletAddress: value })
      .where(eq(user.id, userId));

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/account");
    return { success: true as const };
  } catch (err) {
    console.error("updateWalletAddress error:", err);
    return {
      success: false as const,
      error:
        err instanceof Error ? err.message : "Failed to update wallet address.",
    };
  }
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
