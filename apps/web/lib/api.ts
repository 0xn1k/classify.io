import { webEnv } from "@/lib/env";

export type AppUserRole = "PRINCIPAL" | "TEACHER" | "ACCOUNTANT" | "RECEPTIONIST";
export type StaffRole = "TEACHER" | "ACCOUNTANT" | "RECEPTIONIST";
export type UserStatus = "ACTIVE" | "INACTIVE";

export type SchoolUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  roles: AppUserRole[];
  status: UserStatus;
  createdAt: string;
};

export type SessionUser = {
  id: string;
  schoolId: string;
  name: string;
  email: string | null;
  phone: string;
  roles: AppUserRole[];
  status: UserStatus;
};

export type Permission = string;

// The signed-in user plus the permissions their role grants (from GET /me). Drives
// client-side nav visibility + route guards; the API stays the real enforcement point.
export type CurrentUser = SessionUser & { permissions: Permission[] };

export type SessionResult = {
  user: SessionUser | null;
  needsOnboarding: boolean;
};

export type AuthResult = SessionResult & {
  accessToken: string;
  refreshToken: string;
};

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${webEnv.apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message ?? "Something went wrong. Please try again.");
  }

  return result.data as T;
}

function apiFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  return request<T>(path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init?.headers }
  });
}

// Unauthenticated auth endpoints. The browser hits our API here instead of supabase.co,
// so login/OTP attempts are rate-limited server-side.
export function login(phone: string, password: string) {
  return request<AuthResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password })
  });
}

export function startSignup(phone: string) {
  return request<{ sent: boolean }>("/auth/signup/start", {
    method: "POST",
    body: JSON.stringify({ phone })
  });
}

export function verifySignupOtp(phone: string, token: string) {
  return request<AuthResult>("/auth/signup/verify", {
    method: "POST",
    body: JSON.stringify({ phone, token })
  });
}

export function getSession(token: string) {
  return apiFetch<SessionResult>("/auth/session", token, { method: "POST" });
}

export function getMe(token: string) {
  return apiFetch<CurrentUser>("/me", token, { method: "GET" });
}

export function setupAccount(token: string, payload: { name: string; schoolName: string; password: string }) {
  return apiFetch<SessionUser>("/auth/setup-account", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function listUsers(token: string) {
  return apiFetch<{ items: SchoolUser[] }>("/users", token, { method: "GET" });
}

export function createUser(
  token: string,
  payload: { name: string; phone: string; roles: StaffRole[]; password: string; email?: string }
) {
  return apiFetch<SchoolUser>("/users", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateUser(
  token: string,
  id: string,
  payload: { roles?: StaffRole[]; status?: UserStatus }
) {
  return apiFetch<SchoolUser>(`/users/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}
