"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  userName: string | null;
};

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav: visible from md up */}
      <nav className="hidden items-center gap-3 md:flex md:gap-4">
        <Link
          href="/discover"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Discover
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Dashboard
        </Link>
        <span className="text-sm text-muted-foreground truncate max-w-[140px] lg:max-w-[200px]">
          {userName}
        </span>
        <form action="/api/auth/sign-out" method="POST">
          <button
            type="submit"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Log out
          </button>
        </form>
      </nav>

      {/* Mobile: hamburger + sheet */}
      <div className="flex md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(85vw,280px)]">
            <SheetHeader>
              <SheetTitle className="sr-only">Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-1">
              <Link
                href="/discover"
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Discover
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <div className="my-2 border-t border-border" />
              <p className="px-3 py-2 text-xs text-muted-foreground truncate">
                {userName}
              </p>
              <form action="/api/auth/sign-out" method="POST">
                <button
                  type="submit"
                  className="w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  Log out
                </button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
