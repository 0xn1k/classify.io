import { ModulePlaceholder } from "@/components/module-placeholder";

export default function TeachersPage() {
  return (
    <ModulePlaceholder
      active="/teachers"
      title="Teachers"
      description="Manage teacher profiles, status, and class or subject assignments."
      actionLabel="New teacher"
    />
  );
}
