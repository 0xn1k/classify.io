import { ModulePlaceholder } from "@/components/module-placeholder";

export default function TeacherAttendancePage() {
  return (
    <ModulePlaceholder
      active="/attendance/teachers"
      title="Teacher Attendance"
      description="Manage daily teacher attendance status."
      actionLabel="Save attendance"
    />
  );
}
