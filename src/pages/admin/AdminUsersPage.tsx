import { PlannedPage } from '../PlannedPage';

export default function AdminUsersPage() {
  return (
    <PlannedPage
      title="Users"
      description="Find members, change roles and suspend accounts."
      step="Step 6"
      wireframe="table"
      requirements="MOD-03"
      planned={[
        'Search by display name',
        'Suspend and restore',
        'Grant moderator or admin role',
      ]}
    />
  );
}
