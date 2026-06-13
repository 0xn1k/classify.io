import { ModulePlaceholder } from "@/components/module-placeholder";

export default function StudentAttendancePage() {
  return (
    <ModulePlaceholder
      active="/attendance/students"
      title="Student Attendance"
      description="Mark and review daily class attendance."
      actionLabel="Save attendance"
    />
  );
}
