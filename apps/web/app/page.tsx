import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  Receipt,
  ShieldCheck,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: GraduationCap,
    title: "Student lifecycle",
    description: "Admission to archive, graduation, or exit — parent details, class placement, and status in one record."
  },
  {
    icon: Users,
    title: "Teachers & staff",
    description: "Manage staff, status, and class or subject assignments under role-based access."
  },
  {
    icon: CalendarCheck,
    title: "Attendance",
    description: "Mark and save student and teacher attendance for a class in under two minutes."
  },
  {
    icon: Receipt,
    title: "Fees & receipts",
    description: "Track dues, collections, and receipts, and surface defaulters without manual reconciliation."
  },
  {
    icon: BellRing,
    title: "WhatsApp communication",
    description: "Send school-to-parent and school-to-teacher notices and reminders."
  },
  {
    icon: BookOpen,
    title: "Exams & results",
    description: "Set up exams, enter marks, and generate results and academic reports."
  },
  {
    icon: BarChart3,
    title: "Dashboards & reports",
    description: "Give leadership visibility into fees, attendance, leave, and exam status."
  },
  {
    icon: ShieldCheck,
    title: "RBAC & audit logs",
    description: "Enforce role-based permissions and keep sensitive actions traceable."
  }
];

const personas = [
  { title: "Principal", description: "Operational visibility, user control, and academic insight." },
  { title: "Teacher", description: "Fast attendance and marks entry with minimal friction." },
  { title: "Accountant", description: "Payment visibility, ledgers, receipts, and defaulter reports." },
  { title: "Receptionist", description: "Easy onboarding and searchable student and parent records." }
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-base font-semibold tracking-tight">SchoolOS</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <Badge variant="secondary" className="mb-4">
            Built for schools of 100–1,000 students
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Run your entire school from one platform
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            SchoolOS digitizes and centralizes daily administration, academics, attendance, fees, and
            communication — replacing physical registers, spreadsheets, and scattered WhatsApp threads.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Everything school operations need
              </h2>
              <p className="mt-3 text-muted-foreground">One integrated system across every daily workflow.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <Card key={feature.title} className="h-full">
                    <CardHeader>
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <CardTitle className="pt-2 text-base">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Built for your whole team</h2>
            <p className="mt-3 text-muted-foreground">Role-based access tailored to every role in the school.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {personas.map((persona) => (
              <Card key={persona.title} className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">{persona.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{persona.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t bg-primary text-primary-foreground">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6">
            <h2 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to digitize your school?
            </h2>
            <p className="max-w-xl text-primary-foreground/80">
              Create your institute in minutes — verify your mobile number and you are in.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/signup">
                Create your institute <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">SchoolOS</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Get started
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 SchoolOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
