"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ScanLine, Ticket } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldGroup,
  FieldError,
} from "@/components/ui/field";
import { checkInAttendee } from "@/lib/dashboard/actions";
import type { EventAttendeeWithUser } from "@/lib/dashboard/queries";
import { QRScannerDialog } from "@/components/dashboard/qr-scanner-dialog";

type Props = {
  eventId: string;
  attendees: EventAttendeeWithUser[];
};

export function CheckInSection({ eventId, attendees }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const form = e.currentTarget;
    const code = (form.elements.namedItem("ticketCode") as HTMLInputElement)?.value;
    if (!code?.trim()) {
      setMessage({ type: "error", text: "Enter a ticket code." });
      return;
    }
    setPending(true);
    const result = await checkInAttendee(eventId, code);
    setPending(false);
    if (result.success) {
      if (result.alreadyCheckedIn) {
        setMessage({ type: "success", text: "Already checked in." });
      } else {
        setMessage({ type: "success", text: "Checked in successfully." });
      }
      form.reset();
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  async function handleScannedCode(ticketCode: string) {
    setMessage(null);
    setPending(true);
    const result = await checkInAttendee(eventId, ticketCode);
    setPending(false);
    if (result.success) {
      setMessage({
        type: "success",
        text: result.alreadyCheckedIn ? "Already checked in." : "Checked in successfully.",
      });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  const checkedInCount = attendees.filter((a) => a.checkedInAt).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="size-5" />
          Check-in
        </CardTitle>
        <CardDescription>
          Scan or enter a ticket code to mark attendees as checked in.{" "}
          {attendees.length > 0 && (
            <span className="font-medium text-foreground">
              {checkedInCount} of {attendees.length} checked in
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field>
              <Label htmlFor="ticketCode">Ticket code</Label>
              <div className="flex flex-wrap gap-2">
                <Input
                  id="ticketCode"
                  name="ticketCode"
                  placeholder="e.g. AB12-CD34"
                  className="min-w-32 flex-1 font-mono uppercase"
                  autoComplete="off"
                  disabled={pending}
                />
                <Button type="submit" disabled={pending}>
                  {pending ? "Checking in…" : "Check in"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => setScanOpen(true)}
                >
                  <ScanLine className="size-4 shrink-0" />
                  Scan QR
                </Button>
              </div>
            </Field>
            {message && (
              <FieldError>
                <span className={message.type === "error" ? "text-destructive" : "text-green-600 dark:text-green-400"}>
                  {message.text}
                </span>
              </FieldError>
            )}
          </FieldGroup>
        </form>

        <QRScannerDialog
          open={scanOpen}
          onOpenChange={setScanOpen}
          onScan={handleScannedCode}
        />

        {attendees.length > 0 ? (
          <div>
            <h4 className="mb-3 text-sm font-medium">Attendees</h4>
            <ul className="divide-y divide-border rounded-md border">
              {attendees.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <span className="font-medium">{a.userName}</span>
                    <span className="ml-2 text-muted-foreground">{a.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground">{a.ticketCode}</span>
                    {a.checkedInAt ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="size-3" />
                        Checked in
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not checked in</Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No attendees yet. Registrations will appear here.</p>
        )}
      </CardContent>
    </Card>
  );
}
