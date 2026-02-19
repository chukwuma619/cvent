import { headers } from "next/headers";
import Link from "next/link";
import { Calendar, MapPin, Clock, Users, UserCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  getEventsCreatedByUser,
  getCategories,
} from "@/lib/dashboard/queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatDisplayDate(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DashboardHomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const { data: eventsData, error: eventsError } =
    await getEventsCreatedByUser(userId);
  const categories = await getCategories();
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const events = eventsData ?? [];

  if (eventsError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-6 py-4 text-sm text-destructive">
        {eventsError}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Events you created
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your events, view attendees, and run check-in.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/30 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t created any events yet.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/dashboard/create">Create your first event</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/${event.id}`}
              className="group block no-underline"
            >
              <Card
                className="overflow-hidden transition-shadow hover:shadow-md group-hover:shadow-md"
                size="default"
              >
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
                  <span className="text-xs font-normal text-muted-foreground">
                    {categoryMap.get(event.categoryId) ?? event.categoryId}
                  </span>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
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
                 
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
