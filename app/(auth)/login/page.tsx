"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="w-full max-w-[400px] space-y-6">
      {/* Logo / brand */}
      <Link
        href="/"
        className="flex items-center justify-center gap-2 text-foreground no-underline"
      >
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CalendarCheck className="size-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">cvent</span>
      </Link>

      <Card className="border-border/80 shadow-lg shadow-primary/5">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Sign in with your CKB wallet or email to manage events."
              : "Get started with your CKB wallet or email."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CKB Wallet connect — primary */}
          <div className="space-y-2">
            <Button
              variant="default"
              size="lg"
              className="w-full gap-2 font-medium"
              type="button"
              aria-label="Connect CKB wallet"
            >
              <Wallet className="size-4" />
              Connect CKB wallet
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              JoyID, Rei, OKX, UniSat & more
            </p>
          </div>

          <Separator className="my-4" />

          {/* Email form */}
          <form
            className="space-y-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-8"
                  autoComplete="email"
                />
              </div>
            </div>
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Display name (optional)</Label>
                <div className="relative">
                  <UserPlus className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    className="pl-8"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}
            {mode === "login" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-8"
                    autoComplete="current-password"
                  />
                </div>
              </div>
            )}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="••••••••"
                    className="pl-8"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}
            <Button
              variant="secondary"
              size="lg"
              className="w-full gap-2"
              type="submit"
            >
              {mode === "login" ? (
                <>
                  <LogIn className="size-4" />
                  Sign in with email
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  Sign up with email
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-border/80 pt-4">
          <Link
            href="/"
            className="text-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            ← Back to home
          </Link>
        </CardFooter>
      </Card>

      {/* Login / Sign up toggle */}
      <div className="flex justify-center">
        <div
          role="tablist"
          className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5"
          aria-label="Login or sign up"
        >
          <button
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => setMode("login")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              mode === "login"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Log in
          </button>
          <button
            role="tab"
            aria-selected={mode === "signup"}
            onClick={() => setMode("signup")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              mode === "signup"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
