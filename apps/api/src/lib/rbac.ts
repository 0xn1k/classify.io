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
