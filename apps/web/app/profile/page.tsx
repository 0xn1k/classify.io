"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/roles";
import { useCurrentUser } from "@/lib/use-current-user";

export default function ProfilePage() {
  const { user, isLoading, error } = useCurrentUser();

  return (
    <AppShell active="/profile">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">Your account details.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ProfileSkeleton />
            ) : error || !user ? (
              <p className="text-sm text-destructive">
                {error ?? "You're not signed in. Please sign in again."}
              </p>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Name" value={user.name} />
                <Detail label="Role" value={<Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>} />
                <Detail label="Mobile number" value={user.phone} />
                <Detail label="Email" value={user.email ?? "—"} />
                <Detail
                  label="Status"
                  value={
                    <Badge variant={user.status === "ACTIVE" ? "outline" : "secondary"}>
                      {user.status === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  }
                />
              </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1, 2, 3].map((key) => (
        <div key={key} className="space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
