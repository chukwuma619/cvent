import { headers } from "next/headers";
import Link from "next/link";
import { Calendar, MapPin, Clock, } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  getEventsCreatedByUser,

} from "@/lib/dashboard/queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardHomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const { data: eventsData, error: eventsError } =
    await getEventsCreatedByUser(session.user.id);


  if (eventsError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-6 py-4 text-sm text-destructive">
        {eventsError}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Events you created
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your events, view attendees, and run check-in.
        </p>
      </div>

      {eventsData.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-10 text-center sm:px-6 sm:py-12">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t created any events yet.
          </p>
          <Button asChild className="mt-4 min-h-10 px-4" variant="outline">
            <Link href="/dashboard/create">Create your first event</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eventsData.map((event) => (
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
                    {event.categoryName}
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
                      {event.address}
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
