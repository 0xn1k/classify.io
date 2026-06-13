import { ModulePlaceholder } from "@/components/module-placeholder";

export default function FeesPage() {
  return (
    <ModulePlaceholder
      active="/fees"
      title="Fees"
      description="Track plans, ledgers, payments, receipts, and defaulters."
      actionLabel="Collect payment"
    />
  );
}
