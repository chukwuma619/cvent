import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Clock, Ticket, ArrowLeft } from "lucide-react";
import { getSessionFromHeaders } from "@/lib/auth";
import { getTicketReceiptById } from "@/lib/dashboard/queries";
import { formatDisplayDate } from "@/lib/utils";
import { TicketQR } from "@/components/dashboard/ticket-qr";
import { PrintReceiptButton } from "@/components/dashboard/print-receipt-button";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ ticketId: string }> };

export default async function TicketReceiptPage({ params }: Props) {
  const { ticketId } = await params;
  const session = await getSessionFromHeaders(await headers());
  const walletAddress = session?.walletAddress;

  if (!walletAddress) {
    return null;
  }

  const { data: receipt, error } = await getTicketReceiptById(
    ticketId,
    walletAddress,
  );

  if (error || !receipt) {
    notFound();
  }

  const { event, ticketCode, orderStatus, amountCkbShannons } = receipt;
  const isFree = amountCkbShannons === 0;
  const paymentLabel = isFree ? "Free" : "Paid (CKB)";

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/tickets" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to tickets
          </Link>
        </Button>
        <PrintReceiptButton />
      </div>

      <article
        className="rounded-lg border border-border bg-card p-6 shadow-sm print:border print:shadow-none"
        aria-label="Ticket receipt"
      >
        <div className="border-b border-border pb-4 print:pb-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Ticket receipt
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            {event.title}
          </h1>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 shrink-0 text-muted-foreground" />
            <span>{formatDisplayDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="size-4 shrink-0 text-muted-foreground" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 shrink-0 text-muted-foreground" />
            <span>
              {event.address}, {event.city}, {event.continent}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 rounded-md border border-border bg-muted/30 p-4 print:mt-4">
          <span className="text-xs font-medium text-muted-foreground">
            Show at door
          </span>
          <TicketQR ticketCode={ticketCode} size={160} />
          <span className="font-mono text-sm font-medium">{ticketCode}</span>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm print:mt-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Ticket className="size-4 shrink-0" />
            <span>Ticket code</span>
          </div>
          <span className="font-mono">{ticketCode}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Payment</span>
          <span>
            {paymentLabel}
            {orderStatus === "pending_verification" && " (pending verification)"}
          </span>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground print:mt-4">
          Present this receipt or the QR code at the door. This ticket is
          non-transferable.
        </p>
      </article>
    </div>
  );
}
