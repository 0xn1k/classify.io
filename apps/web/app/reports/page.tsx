import { ModulePlaceholder } from "@/components/module-placeholder";

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      active="/reports"
      title="Reports"
      description="Review attendance, fees, student, teacher, and academic reports."
      actionLabel="Export"
    />
  );
}
