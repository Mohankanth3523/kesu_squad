import { useState, type ReactNode } from 'react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  Checkbox,
  EmptyState,
  ErrorState,
  Field,
  Icon,
  IconButton,
  Input,
  LoadingRegion,
  Modal,
  Select,
  Skeleton,
  Spinner,
  Textarea,
  useToast,
  type IconName,
} from '@/components/ui';
import { paths } from '@/lib/routes';

const COLORS = [
  { name: 'Matte black', token: 'ink', hex: '#0B0B0B', role: 'Page background' },
  { name: 'Charcoal', token: 'charcoal', hex: '#171717', role: 'Surfaces' },
  { name: 'Gold', token: 'gold', hex: '#D4AF37', role: 'Accent, actions, rankings' },
  { name: 'Champagne gold', token: 'champagne', hex: '#F5D76E', role: 'Highlight, hover' },
  { name: 'White', token: 'white', hex: '#FFFFFF', role: 'Main text' },
  { name: 'Grey', token: 'mist', hex: '#B3B3B3', role: 'Secondary text' },
];

const ICONS: IconName[] = [
  'home', 'videos', 'community', 'books', 'donate', 'honour', 'inbox', 'search', 'dashboard', 'user',
  'ama', 'upvote', 'comment', 'flag', 'send', 'add', 'edit', 'delete', 'upload', 'filter',
  'rupee', 'courier', 'free', 'location', 'lock', 'shield', 'crown', 'medal', 'success', 'error',
];

/** Living style guide for review during Milestone A. Removed from production in Milestone C. */
export default function DesignSystemPage() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [price, setPrice] = useState('820');
  const priceError = Number(price) > 750 ? 'The maximum for a current edition with a ₹1,000 printed price is ₹750.' : undefined;

  return (
    <Container className="pb-16">
      <PageHeader
        title="Design system"
        description="Tokens and components for Kesh Squad. Everything here is used across the site."
        actions={<ButtonLink to={paths.home} variant="secondary">Back to site</ButtonLink>}
      />

      <Block title="Colour">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {COLORS.map((c) => (
            <div key={c.token}>
              <div className="h-20 rounded-[var(--radius-field)] border border-line-strong" style={{ background: c.hex }} />
              <p className="mt-2 text-sm font-medium text-white">{c.name}</p>
              <p className="text-xs text-muted">{c.hex} · {c.role}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Typography">
        <div className="space-y-4">
          <p className="font-display text-display-lg text-gold">Kesh Squad</p>
          <p className="font-display text-display text-white">Welcome, Amigos!</p>
          <p className="font-display text-display-sm text-white">Recently listed books</p>
          <p className="max-w-[68ch] text-lg text-mist">
            Body large — Bodoni Moda is reserved for display sizes; Instrument Sans carries everything you read and tap.
          </p>
          <p className="max-w-[68ch] text-mist">Body — 16px with 1.6 line height, kept under about 70 characters per line.</p>
          <p className="text-sm text-muted">Small — metadata, hints and timestamps.</p>
        </div>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger" leadingIcon="delete">Delete</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md" leadingIcon="add">Medium</Button>
          <Button size="lg">Large</Button>
          <IconButton icon="flag" label="Report" />
          <IconButton icon="inbox" label="Inbox" badge={3} />
        </div>
      </Block>

      <Block title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge tone="gold">Current edition</Badge>
          <Badge tone="outline">2021</Badge>
          <Badge tone="success" icon="free">Free</Badge>
          <Badge tone="danger">Removed</Badge>
          <Badge tone="info" icon="info">Prototype</Badge>
          <Badge>Guest</Badge>
        </div>
      </Block>

      <Block title="Cards">
        <div className="grid gap-4 md:grid-cols-3">
          <Card><p className="font-medium text-white">Default</p><p className="mt-1 text-sm text-mist">Charcoal surface for grouped content.</p></Card>
          <Card tone="raised"><p className="font-medium text-white">Raised</p><p className="mt-1 text-sm text-mist">Menus, toasts and overlays.</p></Card>
          <Card tone="gold"><p className="font-medium text-white">Gold hairline</p><p className="mt-1 text-sm text-mist">Feature and call-to-action blocks.</p></Card>
        </div>
      </Block>

      <Block title="Forms">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Book name" hint="As printed on the cover." required>
            {(p) => <Input {...p} placeholder="Essentials of Medical Pharmacology" />}
          </Field>
          <Field label="Asking price" error={priceError} hint="Up to ₹750 for this book." required>
            {(p) => <Input {...p} prefix="₹" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} />}
          </Field>
          <Field label="Course">
            {(p) => (
              <Select {...p} defaultValue="MBBS">
                <option>MBBS</option>
                <option>BDS</option>
              </Select>
            )}
          </Field>
          <Field label="Condition">
            {(p) => (
              <Select {...p} defaultValue="good">
                <option value="like_new">Like new</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="heavily_used">Heavily used</option>
              </Select>
            )}
          </Field>
          <Field label="Description" className="md:col-span-2" hint="Mention highlighting, missing pages or notes.">
            {(p) => <Textarea {...p} />}
          </Field>
          <Checkbox label="I’ll cover shipping" description="Optional. Recipients otherwise pay the agreed courier charge." />
          <Field label="Disabled field">{(p) => <Input {...p} disabled value="Can’t edit" readOnly />}</Field>
        </div>
      </Block>

      <Block title="Modal and toasts">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Button variant="secondary" onClick={() => toast.success('Listing published', 'Buyers can now find your book.')}>Success toast</Button>
          <Button variant="secondary" onClick={() => toast.error('Message not sent', 'Check your connection and try again.')}>Error toast</Button>
          <Button variant="secondary" onClick={() => toast.info('Seller replied', 'Open your inbox to read it.')}>Info toast</Button>
        </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Mark as sold?"
          description="Buyers in your open conversations will see that this book is no longer available."
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  toast.success('Marked as sold');
                }}
              >
                Mark as sold
              </Button>
            </>
          }
        >
          <p className="text-mist">You can’t undo this, but you can list the book again later.</p>
        </Modal>
      </Block>

      <Block title="States">
        <div className="grid gap-6 lg:grid-cols-3">
          <LoadingRegion className="space-y-3 rounded-[var(--radius-surface)] border border-line p-5">
            <Skeleton className="aspect-[3/4] w-24" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
            <Spinner />
          </LoadingRegion>
          <EmptyState icon="books" title="No books match" description="Try clearing a filter." compact action={<Button size="sm" variant="secondary">Clear filters</Button>} />
          <ErrorState compact onRetry={() => toast.info('Retrying…')} />
        </div>
      </Block>

      <Block title="Icons">
        <ul className="grid grid-cols-5 gap-3 sm:grid-cols-10">
          {ICONS.map((name) => (
            <li key={name} className="flex flex-col items-center gap-2 rounded-lg border border-line py-3 text-mist">
              <Icon name={name} className="text-gold" />
              <span className="text-2xs">{name}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center gap-3">
          <Avatar name="ria_reads" size="sm" />
          <Avatar name="dentdiaries" />
          <Avatar name="joel_on_rounds" size="lg" />
        </div>
      </Block>
    </Container>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="mb-6 font-display text-[1.75rem] text-white">{title}</h2>
      {children}
    </section>
  );
}
