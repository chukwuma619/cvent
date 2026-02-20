"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Compass,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "My events", icon: LayoutDashboard },
  { href: "/dashboard/tickets", label: "My tickets", icon: Ticket },
  { href: "/dashboard/create", label: "Create event", icon: PlusCircle },
  { href: "/dashboard/account", label: "Account", icon: User },
  { href: "/discover", label: "Discover", icon: Compass },
] as const;

export function DashboardAside() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: horizontal nav bar */}
      <aside className="mb-6 hidden flex-wrap items-center gap-2 border-b border-border pb-4 md:mb-8 md:flex">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : href === "/discover"
                ? pathname.startsWith("/discover")
                : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium underline-offset-4 hover:bg-muted hover:underline",
                isActive
                  ? "text-foreground underline"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </aside>

      {/* Mobile: fixed bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 md:hidden"
        aria-label="Dashboard navigation"
      >
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : href === "/discover"
                ? pathname.startsWith("/discover")
                : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={label}
            >
              <Icon className="size-5 shrink-0" />
              <span className="truncate max-w-[64px]">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
