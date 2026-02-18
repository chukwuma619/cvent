import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Clock, ArrowLeft, User, Users } from "lucide-react";
import {
  getEventById,
  getCategoryById,
  getHostById,
  getAttendeesCountByEventId,
} from "@/lib/dummy-events";
import { Button } from "@/components/ui/button";

function isEventPast(eventDate: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return eventDate < today;
}

function formatDisplayDate(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-foreground no-underline"
          >
            cvent
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/discover"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Discover
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Log in
            </Link>
          </nav>
        </div>
      </header>

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {getCategoryById(event.categoryId)?.name ?? "Event"}
              </span>
              <span className="text-xs text-muted-foreground">
                {event.city}, {event.continent}
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <User className="size-4 shrink-0" />
                Hosted by {getHostById(event.hostedBy)?.name ?? "Unknown"}
              </span>
              <span className="flex items-center gap-2">
                <Users className="size-4 shrink-0" />
                {getAttendeesCountByEventId(event.id)}{" "}
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
                {event.description}
              </p>
            </div>

            <Button size="lg" className="w-full">
              Get ticket
            </Button>
          </div>
        </article>
      </main>
    </div>
  );
}
