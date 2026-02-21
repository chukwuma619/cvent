"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintReceiptButton() {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => window.print()}
      className="print:hidden"
    >
      <Printer className="mr-2 size-4" />
      Print receipt
    </Button>
  );
}
