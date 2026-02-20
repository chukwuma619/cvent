"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (ticketCode: string) => void;
};

export function QRScannerDialog({ open, onOpenChange, onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animationRef.current != null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => setError(null));
      stopStream();
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        video.srcObject = stream;
        video.play().then(() => {
          if (cancelled) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          function tick() {
            const v = videoRef.current;
            const c = canvasRef.current;
            if (cancelled || !streamRef.current || !v || !c) return;
            const context = c.getContext("2d");
            if (!context) return;
            if (v.readyState === v.HAVE_ENOUGH_DATA) {
              c.width = v.videoWidth;
              c.height = v.videoHeight;
              context.drawImage(v, 0, 0);
              const imageData = context.getImageData(0, 0, c.width, c.height);
              const result = jsQR(imageData.data, imageData.width, imageData.height);
              if (result?.data) {
                const code = String(result.data).trim().toUpperCase();
                if (code) {
                  stopStream();
                  onScan(code);
                  onOpenChange(false);
                  return;
                }
              }
            }
            animationRef.current = requestAnimationFrame(tick);
          }
          tick();
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.name === "NotAllowedError"
              ? "Camera access denied. You can enter the ticket code manually."
              : "Could not access camera. Try entering the ticket code manually."
          );
        }
      });

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, onScan, onOpenChange, stopStream]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={true}
        onPointerDownOutside={() => stopStream()}
        onEscapeKeyDown={() => stopStream()}
      >
        <DialogHeader>
          <DialogTitle>Scan ticket QR code</DialogTitle>
          <DialogDescription>
            Point your camera at the attendee&apos;s ticket QR code. The check-in will complete automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-black">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/95 p-4 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
