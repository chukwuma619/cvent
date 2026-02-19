"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useState, useRef, useEffect } from "react";
import { upload } from "@vercel/blob/client";
import {
  createEvent,
  type CreateEventInput,
} from "@/lib/dashboard/actions";
import type { CategoryOption } from "@/lib/dashboard/queries";

const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must be 5000 characters or less"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  address: z.string().min(1, "Address is required").max(500),
  imageUrl: z.string().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  city: z.string().min(1, "City is required").max(100),
  continent: z.string().min(1, "Continent is required"),
  priceDollars: z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "string" ? parseFloat(v) || 0 : v))
    .pipe(z.number().min(0, "Price must be 0 or more")),
  currency: z.enum(["USD", "EUR", "GBP"]),
});

type CreateEventFormValues = z.output<typeof createEventSchema>;

const CONTINENTS = [
  "Africa",
  "Antarctica",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
] as const;

type CreateEventFormProps = {
  categories: CategoryOption[];
};

const UPLOAD_HANDLER = "/api/upload";

export function CreateEventForm({ categories }: CreateEventFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema) as Resolver<CreateEventFormValues>,
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      address: "",
      imageUrl: "",
      categoryId: "",
      city: "",
      continent: "",
      priceDollars: 0,
      currency: "USD",
    },
  });

  async function onSubmit(values: CreateEventFormValues) {
    setLoading(true);
    setSubmitError(null);
    setUploadError(null);

    let imageUrl: string | null = null;
    if (selectedFile) {
      try {
        const pathname = `events/${crypto.randomUUID()}-${selectedFile.name.replace(/\s+/g, "-")}`;
        const blob = await upload(pathname, selectedFile, {
          access: "public",
          handleUploadUrl: UPLOAD_HANDLER,
        });
        imageUrl = blob.url;
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : "Image upload failed",
        );
        setLoading(false);
        return;
      }
    }

    const input: CreateEventInput = {
      title: values.title,
      description: values.description,
      date: values.date,
      time: values.time,
      address: values.address,
      imageUrl,
      categoryId: values.categoryId,
      city: values.city,
      continent: values.continent,
      priceCents: Math.round(values.priceDollars * 100),
      currency: values.currency,
    };
    const result = await createEvent({ data: input });
    setLoading(false);
    if (result.success) {
      router.push(`/dashboard/${result.eventId}`);
      router.refresh();
      return;
    }
    setSubmitError(result.error ?? null);
  }

  return (
    <Card className="border-border/80 shadow-lg shadow-primary/5">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Create an event</CardTitle>
        <CardDescription>
          Add a new event. You can manage attendees and check-in from the event
          page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {submitError && (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Event title"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="What's this event about?"
                    rows={4}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        {...field}
                        id={field.name}
                        type="date"
                        className="pl-8"
                        aria-invalid={fieldState.invalid}
                      />
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="time"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Time</FieldLabel>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        {...field}
                        id={field.name}
                        type="time"
                        className="pl-8"
                        placeholder="e.g. 6:00 PM – 9:00 PM"
                        aria-invalid={fieldState.invalid}
                      />
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Full address"
                      className="pl-8"
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="imageUrl"
              control={form.control}
              render={() => (
                <Field>
                  <FieldLabel>Event image (optional)</FieldLabel>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (previewUrl) URL.revokeObjectURL(previewUrl);
                          setUploadError(null);
                          setSelectedFile(file);
                          setPreviewUrl(URL.createObjectURL(file));
                          e.target.value = "";
                        }}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                      >
                        <ImageIcon className="mr-2 size-4" />
                        {selectedFile ? "Change image" : "Choose image"}
                      </Button>
                      {selectedFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (previewUrl) URL.revokeObjectURL(previewUrl);
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            setUploadError(null);
                          }}
                          disabled={loading}
                        >
                          Remove image
                        </Button>
                      )}
                    </div>
                    {uploadError && (
                      <p className="text-sm text-destructive" role="alert">
                        {uploadError}
                      </p>
                    )}
                    {previewUrl && (
                      <div className="relative aspect-video max-w-sm overflow-hidden rounded-md border border-border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt="Event preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </Field>
              )}
            />

            <Controller
              name="categoryId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Category</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={field.disabled}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="city"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>City</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="City"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="continent"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Continent</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={field.disabled}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select continent" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTINENTS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="priceDollars"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Price (optional, in dollars)
                    </FieldLabel>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        min={0}
                        step={0.01}
                        className="pl-8"
                        aria-invalid={fieldState.invalid}
                      />
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="currency"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Currency</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={field.disabled}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : "Create event"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
