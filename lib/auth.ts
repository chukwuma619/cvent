import { cookies } from "next/headers";
import { verifyWalletSignature } from "@/lib/ckb";

const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export type Session = {
  walletAddress: string;
};

type StoredSignature = {
  signature: string;
  identity?: string;
  signType: string;
};

type SessionPayload = {
  address: string;
  message: string;
  signature: StoredSignature;
  expiresAt: number;
};

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(value: string): SessionPayload | null {
  try {
    const json = Buffer.from(value, "base64url").toString("utf8");
    const payload = JSON.parse(json) as unknown;
    if (
      !payload ||
      typeof (payload as SessionPayload).address !== "string" ||
      typeof (payload as SessionPayload).message !== "string" ||
      !(payload as SessionPayload).signature ||
      typeof (payload as SessionPayload).expiresAt !== "number"
    ) {
      return null;
    }
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Set session cookie with wallet-signed payload (no server-issued token).
 * Call after verifying the wallet signature on login.
 */
export async function setSessionCookie(
  address: string,
  message: string,
  signature: StoredSignature
): Promise<void> {
  const payload: SessionPayload = {
    address: address.trim(),
    message,
    signature,
    expiresAt: Date.now() + SESSION_MAX_AGE_MS,
  };
  const value = encodePayload(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000),
    path: "/",
  });
}

async function getSessionFromCookieValue(value: string): Promise<Session | null> {
  const payload = decodePayload(value);
  if (!payload) return null;
  if (Date.now() >= payload.expiresAt) return null;
  const valid = await verifyWalletSignature(
    payload.message,
    payload.signature,
    payload.address
  );
  if (!valid) return null;
  return { walletAddress: payload.address };
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!value) return null;
  return getSessionFromCookieValue(value);
}

export async function getSessionFromHeaders(
  headers: Promise<Headers> | Headers
): Promise<Session | null> {
  const h = await Promise.resolve(headers);
  const cookieHeader = h.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`)
  );
  const value = match?.[1]?.trim();
  if (!value) return null;
  return getSessionFromCookieValue(value);
}

export { SESSION_COOKIE_NAME };

/** Clear the session cookie (e.g. on sign out). */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
