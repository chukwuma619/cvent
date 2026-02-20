import { NextResponse } from "next/server";
import { getIssuerId, getPublicKeyPem } from "@/lib/attendance-credential";

/**
 * Well-known endpoint for proof-of-attendance credential verification.
 * Verifiers fetch this to get the issuer id and public key (PEM).
 * Rewritten from /.well-known/attendance-issuer in next.config.
 */
export async function GET() {
  const publicKeyPem = getPublicKeyPem();
  const issuerId = process.env.BETTER_AUTH_URL!;

  if (!publicKeyPem) {
    return NextResponse.json(
      { error: "Issuer not configured" },
      { status: 503 }
    );
  }

  return NextResponse.json({
    id: issuerId,
    publicKey: publicKeyPem,
    algorithm: "EdDSA",
  });
}
