import { PlannedPage } from '../PlannedPage';

export default function AdminReportsPage() {
  return (
    <PlannedPage
      title="Reports"
      description="Review reported posts, comments, listings, users and messages."
      step="Step 6"
      wireframe="table"
      requirements="MOD-01 – MOD-06"
      planned={[
        'Queue of open reports, newest first',
        'Dismiss, remove content, warn or suspend',
        'Every action recorded in an audit log',
      ]}
    />
  );
}
