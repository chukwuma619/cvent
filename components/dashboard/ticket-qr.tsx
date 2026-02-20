"use client";

import { QRCodeSVG } from "qrcode.react";

type Props = {
  ticketCode: string;
  size?: number;
  className?: string;
};

/** Renders a QR code encoding the ticket code for scanning at check-in. */
export function TicketQR({ ticketCode, size = 128, className }: Props) {
  return (
    <div className={className} aria-label="Ticket QR code for check-in">
      <QRCodeSVG
        value={ticketCode.trim().toUpperCase()}
        size={size}
        level="M"
        bgColor="#ffffff"
        fgColor="#000000"
        includeMargin={false}
      />
    </div>
  );
}
