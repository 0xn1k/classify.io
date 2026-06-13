import { ModulePlaceholder } from "@/components/module-placeholder";

export default function UsersPage() {
  return (
    <ModulePlaceholder
      active="/users"
      title="Users"
      description="Manage staff access, roles, and account status."
      actionLabel="Invite user"
    />
  );
}
