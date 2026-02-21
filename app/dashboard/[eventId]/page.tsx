import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Pencil,
} from "lucide-react";
import { getEventDetails, getAttendeesByEventId } from "@/lib/dashboard/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/utils";
import { headers } from "next/headers";
import { getSessionFromHeaders } from "@/lib/auth";
import { CheckInSection } from "@/components/dashboard/check-in-section";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const session = await getSessionFromHeaders(await headers());
  if (!session?.walletAddress) {
    redirect("/login?callbackUrl=/dashboard/" + eventId);
  }

  const { data: eventData, error } = await getEventDetails(eventId);
  if (error || !eventData) {
    notFound();
  }

  const isOwner = eventData.hostedByWallet === session.walletAddress;
  const { data: attendees = [] } = isOwner
    ? await getAttendeesByEventId(eventId)
    : { data: [] };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/dashboard" className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back to my events
          </Link>
        </Button>
        {isOwner && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/${eventId}/edit`} className="inline-flex items-center gap-2">
              <Pencil className="size-4" />
              Edit event
            </Link>
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="relative aspect-21/9 w-full overflow-hidden bg-muted">
          {eventData.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={eventData.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Calendar className="size-16" />
            </div>
          )}
        </div>
        <CardHeader className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            {eventData.categoryName}
          </span>
          <CardTitle className="text-2xl">{eventData.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Hosted by {eventData.hostedByName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="size-4 shrink-0" />
              {formatDisplayDate(eventData.date)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4 shrink-0" />
              {eventData.time}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              {eventData.address}, {eventData.city}, {eventData.continent}
            </span>
          </div>

          {eventData.description && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Description</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {eventData.description}
              </p>
            </div>
          )}

        </CardContent>
      </Card>

      {isOwner && (
        <div className="mt-6">
          <CheckInSection eventId={eventId} attendees={attendees} />
        </div>
      )}
    </div>
  );
}
