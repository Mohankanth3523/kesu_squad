import { PlannedPage } from '../PlannedPage';

export default function AuthCallbackPage() {
  return (
    <PlannedPage
      narrow
      title="Signing you in"
      description="This page finishes email confirmation and sign-in links."
      step="Milestone B"
      wireframe="prose"
      planned={['Completes Supabase sign-in from email links', 'Sends you back to where you started', 'Clear message if a link has expired']}
    />
  );
}
