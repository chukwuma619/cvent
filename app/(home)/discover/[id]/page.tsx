import Link from "next/link";
import { headers } from "next/headers";
import { notFound,redirect } from "next/navigation";
import { Calendar, MapPin, Clock, ArrowLeft, User, Users } from "lucide-react";
import {
  getEvent,
  getAttendeesCountByEventId,
} from "@/lib/dashboard/queries";
import { GetTicketButton } from "./get-ticket-button";
import { auth } from "@/lib/auth";
import { isEventPast, formatDisplayDate } from "@/lib/utils";




export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login?callbackUrl=/discover/" + id);
  }

  const { data: event, error: eventError } = await getEvent(id);
  if (eventError || !event) {
    notFound();
  }

  const { data: attendeeCount, error: attendeeCountError } = await getAttendeesCountByEventId(id);
  if (attendeeCountError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-6 py-4 text-sm text-destructive">
        {attendeeCountError}
      </div>
    );
  }

 
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
    <Link
      href="/discover"
      className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      <ArrowLeft className="size-4" />
      Back to discover
    </Link>

    <article className="space-y-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        {event.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={event.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Calendar className="size-16" />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {event.categoryName}
          </span>
          <span className="text-xs text-muted-foreground">
            {event.address}
          </span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          {event.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <User className="size-4 shrink-0" />
            Hosted by {event.hostedByName ?? "Unknown"}
          </span>
          <span className="flex items-center gap-2">
            <Users className="size-4 shrink-0" />
            {attendeeCount}{" "}
            {isEventPast(event.date) ? "went" : "attending"}
          </span>
        </div>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0" />
            <span>{formatDisplayDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>{event.address}</span>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="mb-2 text-sm font-medium">About this event</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {event.description ?? "No description available"}
          </p>
        </div>

        <GetTicketButton
          eventId={event.id}
          priceCents={event.priceCents}
          currency={event.currency}
          isLoggedIn={!!session}
          hostWalletAddress={event.hostedByWalletAddress}
        />
      </div>
    </article>
  </main>
  );
}
