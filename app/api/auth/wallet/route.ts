import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { isNonceValid, verifyWalletSignature } from "@/lib/ckb";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      message?: string;
      signature?: unknown;
      address?: string;
    };
    const { message, signature, address } = body;
    if (
      typeof message !== "string" ||
      !message.trim() ||
      signature == null ||
      typeof address !== "string" ||
      !address.trim()
    ) {
      return NextResponse.json(
        { error: "Missing or invalid message, signature, or address" },
        { status: 400 }
      );
    }

    if (!isNonceValid(message)) {
      return NextResponse.json(
        { error: "Invalid or expired nonce" },
        { status: 400 }
      );
    }

    const sig =
      typeof signature === "string" ? JSON.parse(signature) : signature;
    if (
      !sig ||
      typeof sig.signature !== "string" ||
      typeof sig.signType !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid signature object" },
        { status: 400 }
      );
    }

    const valid = await verifyWalletSignature(message, sig, address.trim());
    if (!valid) {
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 401 }
      );
    }

    await setSessionCookie(address.trim(), message, sig);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("auth/wallet error:", err);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
