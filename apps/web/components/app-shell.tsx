import Link from "next/link";
import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Receipt,
  Settings,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: GraduationCap },
  { href: "/teachers", label: "Teachers", icon: Users },
  { href: "/attendance/students", label: "Attendance", icon: CalendarCheck },
  { href: "/fees", label: "Fees", icon: Receipt },
  { href: "/communication", label: "Communication", icon: Bell },
  { href: "/exams", label: "Exams", icon: BookOpen },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children, active = "/dashboard" }: { children: ReactNode; active?: string }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card lg:block">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">SchoolOS</div>
            <div className="text-xs text-muted-foreground">Operations</div>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.href || active.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <div className="flex min-h-16 items-center justify-between border-b px-4 lg:px-6">
          <div>
            <div className="text-sm font-medium">Classify School</div>
            <div className="text-xs text-muted-foreground">Academic year 2026-2027</div>
          </div>
          <div className="rounded-md border px-3 py-1.5 text-xs text-muted-foreground">Principal</div>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
