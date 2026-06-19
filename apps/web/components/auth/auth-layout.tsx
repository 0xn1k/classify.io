import Link from "next/link";
import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Shared shell for /login and /signup: brand mark, a centered card, and a footer slot.
export function AuthLayout({
  title,
  subtitle,
  children,
  footer
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">SchoolOS</span>
        </Link>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1.5 p-6 pb-4">
            <CardTitle className="text-xl">{title}</CardTitle>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </CardHeader>
          <CardContent className="p-6 pt-0">{children}</CardContent>
        </Card>

        {footer ? <p className="mt-4 text-center text-sm text-muted-foreground">{footer}</p> : null}

        <p className="mt-6 text-center">
          <Link href="/" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
