import { useLocation } from 'react-router';
import { Container } from '@/components/layout/Container';
import { ButtonLink, Card, Icon, type IconName } from '@/components/ui';
import { paths } from '@/lib/routes';

/** Shown in place of a page the visitor can't open yet. Explains why and what to do. */
export function Gate({ icon, title, description, allowGuest }: { icon: IconName; title: string; description: string; allowGuest?: boolean }) {
  const location = useLocation();
  const next = encodeURIComponent(location.pathname + location.search);
  return (
    <Container className="py-16 sm:py-24">
      <Card tone="gold" className="mx-auto flex max-w-lg flex-col items-center gap-4 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-gold/10 text-gold">
          <Icon name={icon} size="lg" />
        </span>
        <h1 className="font-display text-3xl text-white">{title}</h1>
        <p className="text-mist">{description}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <ButtonLink to={`${paths.login}?next=${next}`} leadingIcon="login">
            Log in
          </ButtonLink>
          {allowGuest ? (
            <ButtonLink to={`${paths.guestResume}?next=${next}`} variant="secondary">
              Continue as guest
            </ButtonLink>
          ) : (
            <ButtonLink to={`${paths.signup}?next=${next}`} variant="secondary">
              Create an account
            </ButtonLink>
          )}
        </div>
      </Card>
    </Container>
  );
}
