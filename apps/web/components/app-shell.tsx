"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Receipt,
  Settings,
  Users
} from "lucide-react";
import type { Permission } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/lib/use-current-user";
import { UserMenu } from "@/components/user-menu";

// Each nav item declares the permission required to see it. Visibility mirrors the API's
// RBAC (returned on GET /me); the API remains the real per-endpoint enforcement point.
const navItems: { href: string; label: string; icon: typeof LayoutDashboard; permission: Permission }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "VIEW_DASHBOARD" },
  { href: "/students", label: "Students", icon: GraduationCap, permission: "VIEW_STUDENTS" },
  { href: "/users", label: "Users", icon: Users, permission: "MANAGE_USERS" },
  { href: "/attendance/students", label: "Attendance", icon: CalendarCheck, permission: "MARK_STUDENT_ATTENDANCE" },
  { href: "/fees", label: "Fees", icon: Receipt, permission: "VIEW_FEES" },
  { href: "/communication", label: "Communication", icon: Bell, permission: "SEND_NOTIFICATIONS" },
  { href: "/exams", label: "Exams", icon: BookOpen, permission: "MANAGE_EXAMS" },
  { href: "/reports", label: "Reports", icon: BarChart3, permission: "VIEW_REPORTS" },
  { href: "/settings", label: "Settings", icon: Settings, permission: "MANAGE_SETTINGS" }
];

// Permission required to view a path (longest matching nav prefix). Paths not in the nav
// (e.g. /profile) have no requirement.
function requiredPermissionFor(path: string): Permission | undefined {
  const match = navItems
    .filter((item) => path === item.href || path.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.permission;
}

export function AppShell({ children, active }: { children: ReactNode; active?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useCurrentUser();
  const activePath = active ?? pathname ?? "/dashboard";

  const required = requiredPermissionFor(activePath);
  const allowed = !required || (user?.permissions.includes(required) ?? false);

  // Client-side guards: bounce unauthenticated users to /login, and users who lack the
  // current page's permission to /dashboard (every role has VIEW_DASHBOARD).
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
    } else if (!allowed) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, allowed, router]);

  if (isLoading || !user || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  const visibleNav = navItems.filter((item) => user.permissions.includes(item.permission));

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
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);

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
          <UserMenu user={user} />
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
