"use client";

import { useTransition, useState } from "react";
import { runPaymentVerification } from "@/lib/dashboard/actions";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function VerifyPaymentsButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  function handleClick() {
    setMessage({ type: null, text: "" });
    startTransition(async () => {
      const result = await runPaymentVerification();
      if (result.ok) {
        setMessage({
          type: "success",
          text:
            result.checked === 0
              ? "No pending orders to verify."
              : `Verified ${result.verified} of ${result.checked} pending payment(s).`,
        });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isPending}
      >
        <RefreshCw
          className={`size-4 shrink-0 ${isPending ? "animate-spin" : ""}`}
        />
        {isPending ? "Verifying…" : "Verify pending payments"}
      </Button>
      {message.text && (
        <p
          className={`text-sm ${
            message.type === "error"
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
