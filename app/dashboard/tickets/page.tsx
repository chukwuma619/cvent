import { headers } from "next/headers";
import Link from "next/link";
import { Calendar, MapPin, Clock, Ticket } from "lucide-react";
import { getSessionFromHeaders } from "@/lib/auth";
import { getTicketsByUserId } from "@/lib/dashboard/queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/utils";
import { TicketQR } from "@/components/dashboard/ticket-qr";
import { GetProofButton } from "@/components/dashboard/get-proof-button";


export default async function MyTicketsPage() {
  const session = await getSessionFromHeaders(await headers());
  const walletAddress = session?.walletAddress;
  if (!walletAddress) {
    return null;
  }

  const { data: tickets, error } = await getTicketsByUserId(walletAddress);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          My tickets
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Events you registered for. Show the QR code or ticket code at the door.
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/30 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any tickets yet.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/discover">Discover events</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map(({ event, ticketCode, checkedInAt }) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="relative aspect-5/3 w-full overflow-hidden bg-muted">
                {event.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={event.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Calendar className="size-12" />
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-2 text-base">
                  {event.title}
                </CardTitle>
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <Ticket className="size-3.5 shrink-0" />
                  {ticketCode}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-muted/30 p-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    Show at door
                  </span>
                  <TicketQR ticketCode={ticketCode} size={120} />
                  <span className="font-mono text-xs text-muted-foreground">
                    {ticketCode}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4 shrink-0" />
                  <span className="text-xs">
                    {formatDisplayDate(event.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4 shrink-0" />
                  <span className="text-xs">{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  <span className="line-clamp-1 text-xs">
                    {event.city}, {event.continent}
                  </span>
                </div>
                {checkedInAt && (
                  <GetProofButton
                    eventId={event.id}
                    eventTitle={event.title}
                  />
                )}
                <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                  <Link href={`/discover/${event.id}`}>View event</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
