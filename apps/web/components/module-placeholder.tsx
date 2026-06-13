import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ModulePlaceholder({
  active,
  title,
  description,
  actionLabel = "Add record"
}: {
  active: string;
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <AppShell active={active}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button size="sm">{actionLabel}</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{title} Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-56 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              No records yet.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
