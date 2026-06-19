"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import type { SessionUser } from "@/lib/api";
import { ROLE_LABELS } from "@/lib/roles";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

// Presentational: AppShell resolves the current user and passes it in.
export function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    // scope: "local" clears the stored session without a server round-trip, so a
    // already-revoked/deleted session can't surface a noisy logout error.
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut({ scope: "local" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-accent"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials(user.name)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight">{user.name}</span>
          <span className="block text-xs leading-tight text-muted-foreground">
            {user.roles.map((role) => ROLE_LABELS[role]).join(", ")}
          </span>
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-60 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          >
            <div className="px-3 py-2">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.phone}</div>
              {user.email ? <div className="text-xs text-muted-foreground">{user.email}</div> : null}
            </div>
            <div className="my-1 h-px bg-border" />
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              disabled={signingOut}
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-destructive hover:bg-accent disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {signingOut ? "Signing out..." : "Log out"}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
