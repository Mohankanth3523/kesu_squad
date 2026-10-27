import { useNavigate, useSearchParams } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { Button, ButtonLink, Icon, useToast } from '@/components/ui';
import { paths } from '@/lib/routes';
import { AuthShell, safeNext } from './AuthShell';

/** Guest access for buyers (C1 §6). The real recovery mechanism depends on OQ-01. */
export default function GuestResumePage() {
  const { user, continueAsGuest } = useSession();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'), paths.inbox);

  return (
    <AuthShell title="Continue as a guest" description="Message sellers and request books without creating a full account. Your phone number is never shared.">
      <ul className="space-y-3 text-sm text-mist">
        <li className="flex gap-2.5">
          <Icon name="lock" size="sm" className="mt-0.5 text-gold" />
          Only you and the other person can read your conversations.
        </li>
        <li className="flex gap-2.5">
          <Icon name="mail" size="sm" className="mt-0.5 text-gold" />
          How guests get back to their chats on another device is still being decided (OQ-01). In this prototype, it works in this browser only.
        </li>
        <li className="flex gap-2.5">
          <Icon name="info" size="sm" className="mt-0.5 text-gold" />
          Guests can’t list books, post or comment — that needs an account.
        </li>
      </ul>
      <div className="mt-8 flex flex-col gap-3">
        {user ? (
          <ButtonLink to={next}>Go to your conversations</ButtonLink>
        ) : (
          <Button
            size="lg"
            onClick={async () => {
              await continueAsGuest();
              toast.success('You’re browsing as a guest');
              navigate(next, { replace: true });
            }}
          >
            Continue as guest
          </Button>
        )}
        <ButtonLink to={`${paths.login}?next=${encodeURIComponent(next)}`} variant="ghost">
          Log in instead
        </ButtonLink>
      </div>
    </AuthShell>
  );
}
