import type { ReactNode } from 'react';
import { Container } from '@/components/layout/Container';
import { Card, Icon } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function AuthShell({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer?: ReactNode }) {
  useDocumentTitle(title);
  return (
    <Container size="narrow" className="py-10 sm:py-16">
      <Card tone="gold" padded={false} className="mx-auto max-w-md p-6 sm:p-8">
        <p className="flex items-start gap-2 rounded-[var(--radius-field)] bg-info/10 px-3 py-2 text-xs text-info">
          <Icon name="info" size="xs" className="mt-0.5" />
          Prototype: there are no real accounts yet. Nothing you type here is sent anywhere, and no email or password is stored.
        </p>
        <h1 className="mt-5 font-display text-display-sm text-white">{title}</h1>
        <p className="mt-2 text-mist">{description}</p>
        <div className="mt-8">{children}</div>
      </Card>
      {footer && <div className="mt-6 text-center text-sm text-mist">{footer}</div>}
    </Container>
  );
}

/** Only allow same-site relative redirects (prevents open redirects). */
export function safeNext(raw: string | null, fallback: string): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return fallback;
  return raw;
}
