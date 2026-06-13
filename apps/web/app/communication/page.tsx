import { ModulePlaceholder } from "@/components/module-placeholder";

export default function CommunicationPage() {
  return (
    <ModulePlaceholder
      active="/communication"
      title="Communication"
      description="Send WhatsApp notices and review delivery status."
      actionLabel="New notice"
    />
  );
}
