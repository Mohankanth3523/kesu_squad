import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui';
import { PricingTable } from '@/features/books/PricingTable';

export default function AdminPricingPage() {
  return (
    <div>
      <PageHeader
        title="Pricing rules"
        description="Maximum selling price by edition age. Editing arrives with the database in Milestone B; every change will be logged."
        compact
      />
      <PricingTable />
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="outline">6+ year cap pending OQ-41</Badge>
        <Badge tone="outline">Age definition pending OQ-42</Badge>
        <Badge tone="outline">Price equal to the cap pending OQ-21</Badge>
      </div>
    </div>
  );
}
