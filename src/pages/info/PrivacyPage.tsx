import { PlannedPage } from '../PlannedPage';

export default function PrivacyPage() {
  return (
    <PlannedPage
      title="Privacy policy"
      description="What we collect, why, and your choices."
      step="Milestone C"
      wireframe="prose"
      requirements="OQ-35"
      planned={[
        'Written for India’s Digital Personal Data Protection Act, 2023',
        'Final text needs owner and legal review',
      ]}
    />
  );
}
