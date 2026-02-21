import Link from "next/link";
import { getCategories } from "@/lib/dashboard/queries";
import { CreateEventForm } from "@/components/dashboard/create-event-form";
import { getSessionFromHeaders } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function CreateEventPage() {
  const { data: categories, error } = await getCategories();
  if (error) {
    return <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-6 py-4 text-sm text-destructive">{error}</div>;
  }

  const session = await getSessionFromHeaders(await headers());
  const walletAddress = session?.walletAddress;
  if (!walletAddress) {
    redirect("/login?callbackUrl=/dashboard/create");
  }

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
          <CreateEventForm categories={categories} walletAddress={walletAddress as string} />
        </div>
      )}
    </div>
  );
}
