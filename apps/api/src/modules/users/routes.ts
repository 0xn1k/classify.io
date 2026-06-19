import { Prisma } from "@prisma/client";
import { Hono } from "hono";
import { z } from "zod";
import { ApiError, ok } from "../../lib/errors.js";
import { notifyStaffCreated } from "../../lib/notify.js";
import { normalizePhone } from "../../lib/phone.js";
import { prisma } from "../../lib/prisma.js";
import { getSupabaseAdmin, hasSupabaseAdmin } from "../../lib/supabase-admin.js";
import { validate } from "../../lib/validation.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/require-permission.js";
import type { AppBindings } from "../../types.js";

export const userRoutes = new Hono<AppBindings>();

// PRINCIPAL is the self-registered school owner; admins only assign these staff roles.
const staffRole = z.enum(["TEACHER", "ACCOUNTANT", "RECEPTIONIST"]);

const createUserSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(8),
  email: z.string().trim().email().optional(),
  password: z.string().min(6),
  roles: z.array(staffRole).min(1)
});

const updateUserSchema = z
  .object({
    roles: z.array(staffRole).min(1).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional()
  })
  .refine((value) => value.roles !== undefined || value.status !== undefined, {
    message: "Provide roles or status to update"
  });

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  status: true,
  createdAt: true,
  roles: { select: { role: true } }
} satisfies Prisma.UserSelect;

type UserWithRoles = Prisma.UserGetPayload<{ select: typeof userSelect }>;

// Flatten the user_roles join into a plain string[] for the API response.
function toApiUser(user: UserWithRoles) {
  const { roles, ...rest } = user;
  return { ...rest, roles: roles.map((assignment) => assignment.role) };
}

userRoutes.get("/users", requireAuth, requirePermission("MANAGE_USERS"), async (c) => {
  const actor = c.get("user");

  const items = await prisma.user.findMany({
    where: { schoolId: actor.schoolId },
    select: userSelect,
    orderBy: [{ name: "asc" }]
  });

  return ok(c, { items: items.map(toApiUser) });
});

userRoutes.post("/users", requireAuth, requirePermission("MANAGE_USERS"), async (c) => {
  const actor = c.get("user");
  const body = validate(createUserSchema, await c.req.json());

  if (!hasSupabaseAdmin()) {
    throw new ApiError(
      500,
      "INTERNAL_ERROR",
      "Staff creation is not configured. Set SUPABASE_SERVICE_ROLE_KEY on the API."
    );
  }

  const phone = normalizePhone(body.phone);
  const admin = getSupabaseAdmin();

  const created = await admin.auth.admin.createUser({
    phone,
    password: body.password,
    phone_confirm: true,
    user_metadata: { name: body.name }
  });

  if (created.error || !created.data.user) {
    throw new ApiError(409, "CONFLICT", "Could not create this login. The phone number may already be in use.");
  }

  try {
    const user = await prisma.user.create({
      data: {
        schoolId: actor.schoolId,
        supabaseUserId: created.data.user.id,
        name: body.name,
        phone,
        email: body.email,
        status: "ACTIVE",
        roles: { create: [...new Set(body.roles)].map((role) => ({ role })) }
      },
      select: userSelect
    });

    const apiUser = toApiUser(user);

    // Notify the new staff member on their mobile. Non-blocking: a delivery failure must
    // never fail account creation. (Currently a no-op seam until a provider is wired.)
    void notifyStaffCreated({ name: apiUser.name, phone: apiUser.phone, roles: apiUser.roles }).catch(
      (notifyError) => {
        console.error("notifyStaffCreated failed", notifyError);
      }
    );

    return ok(c, apiUser, 201);
  } catch (error) {
    // App-row insert failed — roll back the auth user so the two stores don't drift.
    await admin.auth.admin.deleteUser(created.data.user.id);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError(409, "CONFLICT", "A user with this phone number or email already exists.");
    }
    throw error;
  }
});

userRoutes.patch("/users/:id", requireAuth, requirePermission("MANAGE_USERS"), async (c) => {
  const actor = c.get("user");
  const id = c.req.param("id");
  const body = validate(updateUserSchema, await c.req.json());

  if (id === actor.id) {
    throw new ApiError(403, "FORBIDDEN", "You cannot change your own role or status.");
  }

  const target = await prisma.user.findFirst({ where: { id, schoolId: actor.schoolId } });
  if (!target) {
    throw new ApiError(404, "NOT_FOUND", "User not found");
  }

  const user = await prisma.$transaction(async (tx) => {
    if (body.roles) {
      // Replace the user's role set wholesale.
      await tx.userRoleAssignment.deleteMany({ where: { userId: id } });
      await tx.userRoleAssignment.createMany({
        data: [...new Set(body.roles)].map((role) => ({ userId: id, role }))
      });
    }
    if (body.status) {
      await tx.user.update({ where: { id }, data: { status: body.status } });
    }
    return tx.user.findUniqueOrThrow({ where: { id }, select: userSelect });
  });

  return ok(c, toApiUser(user));
});
