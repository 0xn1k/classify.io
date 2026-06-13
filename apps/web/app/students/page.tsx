import { ModulePlaceholder } from "@/components/module-placeholder";

export default function StudentsPage() {
  return (
    <ModulePlaceholder
      active="/students"
      title="Students"
      description="Manage admissions, parent details, class placement, and student status."
      actionLabel="New student"
    />
  );
}
