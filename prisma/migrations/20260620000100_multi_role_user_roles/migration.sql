-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- Backfill the existing single role into the junction table BEFORE dropping the column,
-- so no role data is lost (e.g. the existing principal stays PRINCIPAL).
INSERT INTO "user_roles" ("id", "user_id", "role", "created_at")
SELECT gen_random_uuid(), "id", "role", CURRENT_TIMESTAMP FROM "users";

-- DropIndex
DROP INDEX "users_school_id_role_status_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role";

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles"("user_id", "role");

-- CreateIndex
CREATE INDEX "users_school_id_status_idx" ON "users"("school_id", "status");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
