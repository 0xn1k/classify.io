export const roles = ["PRINCIPAL", "TEACHER", "ACCOUNTANT", "RECEPTIONIST"] as const;

export type UserRole = (typeof roles)[number];

export const permissions = [
  "VIEW_DASHBOARD",
  "MANAGE_STUDENTS",
  "VIEW_STUDENTS",
  "MANAGE_TEACHERS",
  "VIEW_TEACHERS",
  "MARK_STUDENT_ATTENDANCE",
  "MANAGE_TEACHER_ATTENDANCE",
  "MANAGE_LEAVE_REQUESTS",
  "APPLY_LEAVE",
  "MANAGE_FEES",
  "VIEW_FEES",
  "COLLECT_PAYMENTS",
  "GENERATE_RECEIPTS",
  "SEND_NOTIFICATIONS",
  "MANAGE_EXAMS",
  "ENTER_MARKS",
  "MANAGE_RESULTS",
  "VIEW_REPORTS",
  "MANAGE_USERS",
  "MANAGE_ROLES",
  "MANAGE_SETTINGS",
  "VIEW_AUDIT_LOGS"
] as const;

export type Permission = (typeof permissions)[number];

const principalPermissions = new Set<Permission>(permissions);

const rolePermissions: Record<UserRole, Set<Permission>> = {
  PRINCIPAL: principalPermissions,
  TEACHER: new Set([
    "VIEW_DASHBOARD",
    "VIEW_STUDENTS",
    "VIEW_TEACHERS",
    "MARK_STUDENT_ATTENDANCE",
    "APPLY_LEAVE",
    "MANAGE_EXAMS",
    "ENTER_MARKS"
  ]),
  ACCOUNTANT: new Set([
    "VIEW_DASHBOARD",
    "VIEW_STUDENTS",
    "MANAGE_FEES",
    "VIEW_FEES",
    "COLLECT_PAYMENTS",
    "GENERATE_RECEIPTS",
    "VIEW_REPORTS"
  ]),
  RECEPTIONIST: new Set([
    "VIEW_DASHBOARD",
    "MANAGE_STUDENTS",
    "VIEW_STUDENTS",
    "SEND_NOTIFICATIONS"
  ])
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.has(permission) ?? false;
}

// Array form of a role's permissions — used to drive client-side nav/visibility from this
// single source of truth (e.g. returned by GET /me).
export function permissionsForRole(role: UserRole): Permission[] {
  return [...(rolePermissions[role] ?? new Set<Permission>())];
}

// Union of permissions across all of a user's roles. A multi-role user sees every module
// any of their roles grants.
export function permissionsForRoles(roles: UserRole[]): Permission[] {
  const set = new Set<Permission>();
  for (const role of roles) {
    for (const permission of rolePermissions[role] ?? []) {
      set.add(permission);
    }
  }
  return [...set];
}

export function hasAnyPermission(roles: UserRole[], permission: Permission): boolean {
  return roles.some((role) => rolePermissions[role]?.has(permission) ?? false);
}
