import { ModulePlaceholder } from "@/components/module-placeholder";

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      active="/settings"
      title="Settings"
      description="Manage school profile, academic years, classes, subjects, and communication settings."
      actionLabel="Save settings"
    />
  );
}
