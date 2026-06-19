import type { UserStatus } from "@prisma/client";
import type { UserRole } from "./lib/rbac.js";

export type AppUser = {
  id: string;
  schoolId: string;
  supabaseUserId: string;
  name: string;
  email: string | null;
  phone: string;
  roles: UserRole[];
  status: UserStatus;
};

export type AppBindings = {
  Variables: {
    user: AppUser;
    audit: {
      ipAddress?: string;
      userAgent?: string;
    };
  };
};
