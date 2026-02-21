/**
 * Signed proof-of-attendance credentials for bounties, DAO roles, and reputation.
 * Uses Ed25519 (Node crypto); verifiers use the public key from /.well-known/attendance-issuer.
 */

import {
  createPrivateKey,
  createPublicKey,
  sign,
  type KeyObject,
} from "node:crypto";

const ALG = "EdDSA";
const TYP = "JWT";

export type AttendancePayload = {
  /** Subject: wallet address (preferred for bounties/DAO) or opaque user id */
  sub: string;
  /** Event id */
  eventId: string;
  /** Human-readable event title */
  eventTitle: string;
  /** ISO 8601 check-in time */
  checkedInAt: string;
  /** Issuer id (e.g. https://yourapp.com) */
  iss: string;
  /** Issued-at time (Unix seconds) */
  iat: number;
};

function base64urlEncode(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64url");
}

function getPrivateKey(): KeyObject | null {
  const pem = process.env.ATTENDANCE_ISSUER_PRIVATE_KEY?.trim();
  if (!pem) return null;
  try {
    return createPrivateKey({ key: pem, format: "pem" });
  } catch {
    return null;
  }
}

export function getIssuerId(): string | null {
  const url = (
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL
  )?.trim();
  if (!url) return null;
  return url.replace(/\/$/, "");
}

/**
 * Create a signed JWT credential for the given payload.
 * Returns null if signing key is not configured.
 */
export function createAttendanceCredential(
  payload: AttendancePayload,
  issuerId: string
): string | null {
  const key = getPrivateKey();
  if (!key) return null;

  const header = { alg: ALG, typ: TYP };
  const payloadWithIss = { ...payload, iss: issuerId };
  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payloadWithIss));
  const message = `${headerB64}.${payloadB64}`;
  const signature = sign(null, Buffer.from(message, "utf8"), key);
  const signatureB64 = base64urlEncode(signature);
  return `${message}.${signatureB64}`;
}

/**
 * Export the public key in PEM format for /.well-known/attendance-issuer.
 * Returns null if private key is not configured (we derive public from private).
 */
export function getPublicKeyPem(): string | null {
  const key = getPrivateKey();
  if (!key) return null;
  try {
    const publicKey = createPublicKey(key);
    return publicKey.export({ type: "spki", format: "pem" }) as string;
  } catch {
    return null;
  }
}

/**
 * Build payload for an attended event. Subject is wallet address when available, else userId.
 */
export function buildAttendancePayload(params: {
  subjectWallet: string | null;
  subjectUserId: string;
  eventId: string;
  eventTitle: string;
  checkedInAt: Date;
  issuerId: string;
}): AttendancePayload {
  return {
    sub: params.subjectWallet?.trim() || params.subjectUserId,
    eventId: params.eventId,
    eventTitle: params.eventTitle,
    checkedInAt: params.checkedInAt.toISOString(),
    iss: params.issuerId,
    iat: Math.floor(Date.now() / 1000),
  };
}
