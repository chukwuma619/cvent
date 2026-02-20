import { headers } from "next/headers";
import Link from "next/link";
import { Wallet, ExternalLink, Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { getOrdersForHost } from "@/lib/dashboard/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";

const SHANNONS_PER_CKB = 100_000_000;

function formatCkb(shannons: number): string {
  const ckb = shannons / SHANNONS_PER_CKB;
  return ckb.toFixed(4);
}

export default async function EarningsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login?callbackUrl=/dashboard/earnings");
  }

  const { data: orders, error } = await getOrdersForHost(session.user.id);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-6 py-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  const paidOrders = orders.filter((o) => o.txHash);
  const totalCkbShannons = paidOrders.reduce((sum, o) => sum + o.amountCkbShannons, 0);

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Earnings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Orders for your events. Paid orders are verified on-chain.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="mx-auto size-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              No orders yet. Orders appear here when someone registers for your paid events.
            </p>
            <Link
              href="/dashboard/create"
              className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Create an event
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Summary</CardTitle>
              <CardDescription>
                Paid orders (with on-chain tx): {paidOrders.length}. Total: {formatCkb(totalCkbShannons)} CKB
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent orders</CardTitle>
              <CardDescription>
                All registrations for events you host (free and paid).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-3 py-2 text-left font-medium">Event</th>
                      <th className="px-3 py-2 text-left font-medium">Buyer</th>
                      <th className="px-3 py-2 text-right font-medium">Amount</th>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Tx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.orderId} className="border-b border-border">
                        <td className="px-3 py-2">
                          <Link
                            href={`/dashboard/${o.eventId}`}
                            className="font-medium text-primary underline-offset-4 hover:underline"
                          >
                            {o.eventTitle}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{o.buyerName}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {o.amountCkbShannons > 0
                            ? `${formatCkb(o.amountCkbShannons)} CKB`
                            : "Free"}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="size-3.5" />
                            {new Date(o.orderCreatedAt).toLocaleDateString(undefined, {
                              dateStyle: "short",
                            })}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {o.txHash ? (
                            <a
                              href={`https://explorer.nervos.org/transaction/${o.txHash.startsWith("0x") ? o.txHash : `0x${o.txHash}`}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                            >
                              <ExternalLink className="size-3.5" />
                              View
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
