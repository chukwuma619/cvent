import { NextRequest, NextResponse } from "next/server";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const currency = request.nextUrl.searchParams.get("currency")?.toLowerCase() ?? "usd";
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=nervos-network&vs_currencies=${currency}`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`CoinGecko responded with ${res.status}`);
    }
    const data = (await res.json()) as {
      "nervos-network"?: { [key: string]: number };
    };
    const price = data["nervos-network"]?.[currency];
    if (typeof price !== "number" || price <= 0) {
      throw new Error("Invalid CKB price");
    }
    return NextResponse.json({ price });
  } catch (err) {
    console.error("ckb-price error:", err);
    return NextResponse.json(
      { error: "Failed to fetch CKB price" },
      { status: 502 }
    );
  }
}
