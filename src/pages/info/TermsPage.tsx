import { PlannedPage } from '../PlannedPage';

export default function TermsPage() {
  return (
    <PlannedPage
      title="Terms of use"
      description="The rules for using Kesh Squad."
      step="Milestone C"
      wireframe="prose"
      requirements="OQ-35"
      planned={[
        'Final text needs owner and legal review',
        'Covers accounts, content, marketplace conduct and liability',
      ]}
    />
  );
}
