import Link from "next/link";
import { getCategories } from "@/lib/dashboard/queries";
import { CreateEventForm } from "@/components/dashboard/create-event-form";

export default async function CreateEventPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an event
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the details below. Your event will appear on your dashboard
          and in discover once created.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/30 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No categories found. Add categories to the database (e.g. via seed)
            before creating events.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to dashboard
          </Link>
        </div>
      ) : (
        <div className="max-w-2xl">
          <CreateEventForm categories={categories} />
        </div>
      )}
    </div>
  );
}
