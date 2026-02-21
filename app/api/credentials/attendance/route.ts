import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth";
import {
  buildAttendancePayload,
  createAttendanceCredential,
  getIssuerId,
} from "@/lib/attendance-credential";
import { headers } from "next/headers";
import { getAttendedTicketForUser } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/credentials/attendance?eventId=...
 * Returns a signed proof-of-attendance credential (JWT) for the current user
 * and the given event, only if they were checked in. For bounties, DAO roles, reputation.
 */
export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId");
  if (!eventId?.trim()) {
    return NextResponse.json({ error: "eventId is required" }, { status: 400 });
  }

  const session = await getSessionFromHeaders(await headers());
  if (!session?.walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: attended, error } = await getAttendedTicketForUser(
    session.walletAddress,
    eventId.trim(),
  );
  if (error) {
    return NextResponse.json(
      { error: "Failed to load attendance" },
      { status: 500 },
    );
  }
  if (!attended) {
    return NextResponse.json(
      { error: "No checked-in attendance found for this event" },
      { status: 404 },
    );
  }
  const issuerId = getIssuerId();
  if (!issuerId) {
    return NextResponse.json(
      { error: "Issuer not configured" },
      { status: 503 },
    );
  }
  const payload = buildAttendancePayload({
    subjectWallet: attended.userWalletAddress,
    subjectUserId: attended.userId,
    eventId: attended.eventId,
    eventTitle: attended.eventTitle,
    checkedInAt: attended.checkedInAt,
    issuerId,
  });

  const credential = createAttendanceCredential(payload, issuerId);
  if (!credential) {
    return NextResponse.json(
      { error: "Credential signing is not configured" },
      { status: 503 },
    );
  }

  return NextResponse.json({ credential });
}
