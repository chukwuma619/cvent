import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-linear-to-b from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-[400px] space-y-6">
        <Link
          href="/"
          className="flex items-center justify-center text-foreground no-underline"
        >
          <span className="text-xl font-semibold tracking-tight">cvent</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
