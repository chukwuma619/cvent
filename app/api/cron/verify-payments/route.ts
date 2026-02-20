import { NextRequest, NextResponse } from "next/server";
import { verifyAllPendingPaymentOrders } from "@/lib/discover/actions";


export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : request.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET?.trim();

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await verifyAllPendingPaymentOrders();
    return NextResponse.json({
      ok: true,
      checked: result.checked,
      verified: result.verified,
    });
  } catch (err) {
    console.error("cron verify-payments:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verification failed" },
      { status: 500 }
    );
  }
}
