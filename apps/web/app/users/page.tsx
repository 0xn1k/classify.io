"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createUser, listUsers, updateUser, type SchoolUser, type StaffRole } from "@/lib/api";
import { STAFF_ROLE_OPTIONS } from "@/lib/roles";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

async function readToken() {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}

// Staff roles a user currently holds (PRINCIPAL is the owner and isn't editable here).
function staffRolesOf(user: SchoolUser): StaffRole[] {
  return user.roles.filter((role): role is StaffRole => role !== "PRINCIPAL");
}

export default function UsersPage() {
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<SchoolUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const accessToken = await readToken();
      if (!accessToken) {
        setLoadError("Your session has expired. Please sign in again.");
        return;
      }
      setToken(accessToken);
      const { items } = await listUsers(accessToken);
      setUsers(items);
    } catch (caught) {
      setLoadError(errorMessage(caught, "We couldn't load your users. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusToggle(user: SchoolUser) {
    if (!token) return;
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const updated = await updateUser(token, user.id, { status: nextStatus });
    setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function handleRolesChange(user: SchoolUser, roles: StaffRole[]) {
    if (!token) return;
    const updated = await updateUser(token, user.id, { roles });
    setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  const staff = users.filter((user) => !user.roles.includes("PRINCIPAL"));

  return (
    <AppShell active="/users">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
            <p className="text-sm text-muted-foreground">
              Add users, assign one or more roles, and control what each can access.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowForm((value) => !value)}>
            {showForm ? "Close" : "Add user"}
          </Button>
        </div>

        {showForm ? (
          <AddUserForm token={token} onCreated={(user) => setUsers((prev) => [...prev, user])} />
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Staff</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <UsersSkeleton />
            ) : loadError ? (
              <ErrorState message={loadError} onRetry={load} />
            ) : staff.length === 0 ? (
              <EmptyState onAdd={() => setShowForm(true)} />
            ) : (
              <ul className="flex flex-col gap-3">
                {staff.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onRolesChange={handleRolesChange}
                    onStatusToggle={handleStatusToggle}
                  />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

// Toggle group over the assignable staff roles. Keeps at least one role selected.
function RoleChips({
  value,
  onChange,
  disabled
}: {
  value: StaffRole[];
  onChange: (roles: StaffRole[]) => void;
  disabled?: boolean;
}) {
  function toggle(role: StaffRole) {
    if (value.includes(role)) {
      const next = value.filter((item) => item !== role);
      if (next.length === 0) return; // a user must keep at least one role
      onChange(next);
    } else {
      onChange([...value, role]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STAFF_ROLE_OPTIONS.map((option) => {
        const active = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => toggle(option.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function UserRow({
  user,
  onRolesChange,
  onStatusToggle
}: {
  user: SchoolUser;
  onRolesChange: (user: SchoolUser, roles: StaffRole[]) => Promise<void>;
  onStatusToggle: (user: SchoolUser) => Promise<void>;
}) {
  const [isBusy, setIsBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setIsBusy(true);
    try {
      await action();
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <li className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{user.name}</span>
          <Badge variant={user.status === "ACTIVE" ? "outline" : "secondary"}>
            {user.status === "ACTIVE" ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">{user.phone}</div>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <RoleChips
          value={staffRolesOf(user)}
          disabled={isBusy}
          onChange={(roles) => run(() => onRolesChange(user, roles))}
        />
        <Button size="sm" variant="outline" disabled={isBusy} onClick={() => run(() => onStatusToggle(user))}>
          {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </li>
  );
}

function AddUserForm({
  token,
  onCreated
}: {
  token: string | null;
  onCreated: (user: SchoolUser) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<StaffRole[]>(["TEACHER"]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; phone: string; password: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (roles.length === 0) {
      setError("Select at least one role.");
      return;
    }

    setIsSaving(true);
    try {
      const user = await createUser(token, {
        name,
        phone,
        roles,
        password,
        email: email.trim() || undefined
      });
      onCreated(user);
      // Surface the credentials to share — SMS delivery isn't enabled yet.
      setCreated({ name: user.name, phone: user.phone, password });
      setName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setRoles(["TEACHER"]);
    } catch (caught) {
      setError(errorMessage(caught, "We couldn't add this user. Please try again."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a user</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {created ? (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
            <p className="font-medium">{created.name}&rsquo;s account is ready — share these to sign in</p>
            <div className="mt-2 space-y-1 text-muted-foreground">
              <p>
                Mobile: <span className="font-medium text-foreground">{created.phone}</span>
              </p>
              <p>
                Password: <span className="font-medium text-foreground">{created.password}</span>
              </p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              SMS notifications aren&rsquo;t enabled yet, so please share these manually.
            </p>
          </div>
        ) : null}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <TextField label="Full name" value={name} onChange={setName} required />
          <TextField
            label="Mobile number"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="+91 98765 43210"
            required
          />
          <TextField label="Email (optional)" type="email" value={email} onChange={setEmail} />
          <TextField
            label="Temporary password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 6 characters"
            required
          />
          <div className="space-y-2">
            <span className="text-sm font-medium">Roles</span>
            <RoleChips value={roles} onChange={setRoles} disabled={isSaving} />
            <p className="text-xs text-muted-foreground">
              The user will see every module any of their roles allows.
            </p>
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive">{error}</div>
          ) : null}

          <Button className="w-full sm:w-auto sm:self-start" disabled={isSaving}>
            {isSaving ? "Adding..." : created ? "Add another" : "Add user"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function UsersSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {[0, 1, 2].map((key) => (
        <li key={key} className="flex items-center justify-between rounded-md border p-3">
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded bg-muted" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center">
      <p className="text-sm text-muted-foreground">
        No staff yet. Add teachers, accountants, or receptionists and assign their roles.
      </p>
      <Button size="sm" onClick={onAdd}>
        Add your first user
      </Button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-md border border-destructive/40 p-6 text-center">
      <p className="text-sm text-destructive">{message}</p>
      <Button size="sm" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
