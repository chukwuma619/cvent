"use client";

import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  eventId: string;
  eventTitle?: string;
};

export function GetProofButton({ eventId }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleGetProof() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/credentials/attendance?eventId=${encodeURIComponent(eventId)}`
      );
      const data = (await res.json()) as { credential?: string; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to get proof");
        return;
      }
      if (!data.credential) {
        toast.error("No credential returned");
        return;
      }
      const blob = new Blob(
        [JSON.stringify({ credential: data.credential }, null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proof-of-attendance-${eventId.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Proof downloaded. Use it for bounties, DAO roles, or reputation.");
    } catch {
      toast.error("Failed to get proof");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full gap-2"
      onClick={handleGetProof}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <ShieldCheck className="size-4" />
      )}
      Get proof of attendance
    </Button>
  );
}
