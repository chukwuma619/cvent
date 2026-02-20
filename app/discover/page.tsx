import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock } from "lucide-react";
import {
  getAllEvents,
  getCategoriesWithDisplay,
} from "@/lib/dashboard/queries";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { formatDisplayDate } from "@/lib/utils";


export default async function DiscoverPage() {
  const { data: eventsData, error: eventsError } = await getAllEvents();
  const { data: categories, error: categoriesError } =
    await getCategoriesWithDisplay();

  if (categoriesError || eventsError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-6 py-4 text-sm text-destructive">
        {categoriesError || eventsError}
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-foreground no-underline"
          >
            cvent
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/discover"
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
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

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Discover events
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Find and join events near you. Proof of attendance powered by CKB.
          </p>
        </div>

        {eventsError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-6 py-4 text-sm text-destructive">
            {eventsError}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventsData.map((event) => (
                <Link
                  key={event.id}
                  href={`/discover/${event.id}`}
                  className="group block no-underline"
                >
                  <Card
                    className="overflow-hidden transition-shadow hover:shadow-md group-hover:shadow-md"
                    size="default"
                  >
                    <div className="relative aspect-[5/3] w-full overflow-hidden bg-muted">
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
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Calendar className="mt-0.5 size-4 shrink-0" />
                        <span className="text-xs">
                          {formatDisplayDate(event.date)}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Clock className="mt-0.5 size-4 shrink-0" />
                        <span className="text-xs">{event.time}</span>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="mt-0.5 size-4 shrink-0" />
                        <span className="line-clamp-2 text-xs">
                          {event.address}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-12 flex flex-col gap-2">
              <h2 className="text-lg font-semibold tracking-tight">
                Browse by category:
              </h2>
              <div className="grid grid-cols-5 gap-2">
                {categories.map((cat) => {
                  const eventCount = eventsData.filter((e) => e.categoryId === cat.id).length;
                  return (
                    <Link key={cat.id} href={`/discover/category/${cat.id}`}>
                      <Item variant="outline">
                        <ItemMedia>
                          <span
                            className="flex size-10 shrink-0 items-center justify-center [&_svg]:size-5"
                            style={{ color: cat.color }}
                            dangerouslySetInnerHTML={{ __html: cat.icon }}
                          />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>{cat.name}</ItemTitle>
                          <ItemDescription>
                            {eventCount} event
                            {eventCount === 1 ? "" : "s"}
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
