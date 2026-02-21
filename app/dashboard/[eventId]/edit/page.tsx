import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCategories } from "@/lib/dashboard/queries";
import { getEventForEdit } from "@/lib/dashboard/queries";
import { CreateEventForm } from "@/components/dashboard/create-event-form";
import { Button } from "@/components/ui/button";
import { headers } from "next/headers";
import { getSessionFromHeaders } from "@/lib/auth";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const session = await getSessionFromHeaders(await headers());
  if (!session?.walletAddress) {
    redirect("/login?callbackUrl=/dashboard/" + eventId + "/edit");
  }

  const [{ data: categories, error: categoriesError }, { data: eventData, error: eventError }] =
    await Promise.all([
      getCategories(),
      getEventForEdit(eventId, session.walletAddress),
    ]);

  if (categoriesError || !categories.length) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-6 py-4 text-sm text-destructive">
        {categoriesError ?? "No categories found."}
      </div>
    );
  }

  if (eventError || !eventData) {
    notFound();
  }

  const initialData = {
    id: eventData.id,
    title: eventData.title,
    description: eventData.description,
    date: eventData.date,
    time: eventData.time,
    address: eventData.address,
    imageUrl: eventData.imageUrl ?? undefined,
    categoryId: eventData.categoryId,
    city: eventData.city,
    continent: eventData.continent,
    priceCents: eventData.priceCents,
    currency: eventData.currency as "USD" | "EUR" | "GBP",
  };

  return (
    <div>
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2 text-muted-foreground">
          <Link href={`/dashboard/${eventId}`}>← Back to event</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Edit event</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the details below. Changes will appear on your dashboard and in discover.
        </p>
      </div>

      <div className="max-w-2xl">
        <CreateEventForm
          categories={categories}
          mode="edit"
          walletAddress={session.walletAddress as string}
          eventId={eventId}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
