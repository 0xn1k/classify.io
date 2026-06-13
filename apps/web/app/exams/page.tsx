import { ModulePlaceholder } from "@/components/module-placeholder";

export default function ExamsPage() {
  return (
    <ModulePlaceholder
      active="/exams"
      title="Exams"
      description="Configure exams, enter marks, and prepare results."
      actionLabel="New exam"
    />
  );
}
