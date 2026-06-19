import type { AppUserRole, StaffRole } from "@/lib/api";

export const ROLE_LABELS: Record<AppUserRole, string> = {
  PRINCIPAL: "Principal",
  TEACHER: "Teacher",
  ACCOUNTANT: "Accountant",
  RECEPTIONIST: "Receptionist"
};

export const STAFF_ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: "TEACHER", label: "Teacher" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "RECEPTIONIST", label: "Receptionist" }
];
