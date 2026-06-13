import { CalendarCheck, IndianRupee, Users, UserX } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  { label: "Active students", value: "0", detail: "Across all classes", icon: Users },
  { label: "Today attendance", value: "--", detail: "No attendance saved yet", icon: CalendarCheck },
  { label: "Absent students", value: "0", detail: "Today", icon: UserX },
  { label: "Pending fees", value: "Rs 0", detail: "Current month", icon: IndianRupee }
];

const workQueue = [
  { label: "Student attendance", status: "Not started", tone: "secondary" as const },
  { label: "Teacher attendance", status: "Not started", tone: "secondary" as const },
  { label: "Fee collections", status: "Ready", tone: "outline" as const },
  { label: "Exam setup", status: "Draft", tone: "outline" as const }
];

export default function DashboardPage() {
  return (
    <AppShell active="/dashboard">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Daily school operations at a glance.</p>
          </div>
          <Button size="sm">Mark attendance</Button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <Card key={metric.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>{metric.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{metric.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Work Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workQueue.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  <Badge variant={item.tone}>{item.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Setup Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">API service</span>
                <Badge variant="outline">Scaffolded</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prisma schema</span>
                <Badge variant="outline">Ready</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supabase auth</span>
                <Badge variant="secondary">Pending env</Badge>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
