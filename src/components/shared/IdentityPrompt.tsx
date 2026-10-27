import { useLocation, useNavigate } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { Button, Icon, Modal, useToast } from '@/components/ui';
import { paths } from '@/lib/routes';

/**
 * Asks a visitor to log in or continue as a guest before a private action
 * (messaging a seller, requesting a donation, asking a question). C1 §6.
 */
export function IdentityPrompt({
  open,
  onClose,
  title,
  description,
  allowGuest = true,
  onReady,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  allowGuest?: boolean;
  /** Called after the visitor becomes a guest, so the original action can continue. */
  onReady?: () => void;
}) {
  const { continueAsGuest } = useSession();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const next = encodeURIComponent(location.pathname + location.search);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant={allowGuest ? 'ghost' : 'secondary'} onClick={() => navigate(`${paths.login}?next=${next}`)}>
            Log in
          </Button>
          {allowGuest ? (
            <Button
              onClick={async () => {
                await continueAsGuest();
                toast.success('You’re browsing as a guest', 'Prototype guest identity, kept in this browser.');
                onClose();
                onReady?.();
              }}
            >
              Continue as guest
            </Button>
          ) : (
            <Button onClick={() => navigate(`${paths.signup}?next=${next}`)}>Create an account</Button>
          )}
        </>
      }
    >
      <ul className="space-y-2.5 text-sm text-mist">
        <li className="flex gap-2.5">
          <Icon name="lock" size="sm" className="mt-0.5 text-gold" />
          Conversations are private to the two people in them.
        </li>
        <li className="flex gap-2.5">
          <Icon name="shield" size="sm" className="mt-0.5 text-gold" />
          Your phone number is never shown publicly.
        </li>
      </ul>
    </Modal>
  );
}
