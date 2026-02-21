import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

const NONCE_PREFIX = "cvent:";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = Date.now();
  const random = randomBytes(8).toString("hex");
  const nonce = `${NONCE_PREFIX}${timestamp}:${random}`;
  return NextResponse.json({ nonce });
}
