import { Link } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, ButtonLink, Card, EmptyState, Icon } from '@/components/ui';
import { Loadable } from '@/components/shared/Loadable';
import { ListSkeleton } from '@/components/shared/Skeletons';
import { BADGES, nextBadge } from '@/domain/constants';
import { useAsync } from '@/hooks/useAsync';
import { cn } from '@/lib/cn';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import type { DonorStanding } from '@/types/domain';
import { BadgeIcon, BadgeRow } from '@/features/donations/Badges';

/** The Kesh Squad Honour Board (C1 §5). Only display names and donation stats are public. */
export default function HonourBoardPage() {
  const standings = useAsync(() => services.honour.listStandings());

  return (
    <Container className="pb-16">
      <PageHeader
        title="The Kesh Squad Honour Board"
        description="Recognising those who give knowledge a second life."
        actions={<ButtonLink to={paths.newDonation} leadingIcon="donate">Donate a book</ButtonLink>}
      />

      <Loadable
        query={standings}
        skeleton={<ListSkeleton rows={6} compact />}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState icon="honour" title="No completed donations yet" description="The first donor’s name goes here." action={<ButtonLink to={paths.newDonation} size="sm">Donate a book</ButtonLink>} />}
      >
        {(list) => (
          <>
            <Podium top={list.slice(0, 3)} />
            <YourStanding list={list} />
            <section aria-labelledby="rankings" className="mt-12">
              <h2 id="rankings" className="font-display text-[1.75rem] text-white">
                All donors
              </h2>
              <div className="mt-4 overflow-x-auto rounded-[var(--radius-surface)] border border-line">
                <table className="w-full min-w-[34rem] text-left">
                  <caption className="sr-only">Donors ranked by books donated</caption>
                  <thead className="bg-charcoal text-sm text-mist">
                    <tr>
                      <th scope="col" className="w-20 px-4 py-3 font-medium">Rank</th>
                      <th scope="col" className="px-4 py-3 font-medium">Donor</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">Books donated</th>
                      <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">Badges</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {list.map((s) => (
                      <tr key={s.donor.id} className={cn(s.rank <= 3 && 'bg-gold/[0.04]')}>
                        <td className={cn('px-4 py-3.5 font-display text-2xl tabular-nums', s.rank <= 3 ? 'text-champagne' : 'text-mist')}>{s.rank}</td>
                        <td className="px-4 py-3.5">
                          <Link to={paths.profile(s.donor.displayName)} className="inline-flex items-center gap-3 text-white hover:text-champagne">
                            <Avatar name={s.donor.displayName} size="sm" />
                            {s.donor.displayName}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-white tabular-nums">{s.booksDonated}</td>
                        <td className="hidden px-4 py-3.5 sm:table-cell">
                          <BadgeRow badges={s.badges} compact />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </Loadable>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl text-white">How ranking works</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-mist">
            {[
              'Each completed book donation earns one point.',
              'Rankings are based on the total number of books donated.',
              'Multiple books are counted individually.',
              'Cancelled or unfinished donations don’t count.',
              'Rankings update when a donation is confirmed by both the donor and the recipient.',
              'If two donors are tied, whoever reached the total first ranks higher.',
            ].map((r) => (
              <li key={r} className="flex gap-2.5">
                <Icon name="check" size="sm" className="mt-0.5 text-gold" />
                {r}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-display text-2xl text-white">Badges</h2>
          <ul className="mt-4 space-y-3">
            {BADGES.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="inline-flex items-center gap-2.5 text-white">
                  <BadgeIcon id={b.id} />
                  {b.name}
                </span>
                <span className="text-muted tabular-nums">
                  {b.threshold} {b.threshold === 1 ? 'book' : 'books'}
                  {b.id === 'legend' && ' (proposed)'}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <p className="mt-6 text-xs text-muted">Prototype: donor names and counts are illustrative sample data.</p>
    </Container>
  );
}

function Podium({ top }: { top: DonorStanding[] }) {
  // Display order 2 · 1 · 3 on wide screens so first place sits in the middle.
  const order = [top[1], top[0], top[2]].filter((s): s is DonorStanding => Boolean(s));
  return (
    <ol aria-label="Top three donors" className="grid gap-4 sm:grid-cols-3 sm:items-end">
      {order.map((s) => (
        <li
          key={s.donor.id}
          className={cn(
            'relative flex flex-col items-center rounded-[var(--radius-surface)] border px-5 pt-6 pb-5 text-center',
            s.rank === 1 ? 'order-first border-gold/60 bg-gradient-to-b from-gold/15 to-charcoal sm:order-none sm:pb-8' : 'border-gold/25 bg-charcoal',
          )}
        >
          <span className={cn('font-display leading-none', s.rank === 1 ? 'text-display text-champagne' : 'text-5xl text-gold')} aria-label={`Rank ${s.rank}`}>
            {s.rank}
          </span>
          {s.rank === 1 && <Icon name="crown" className="absolute top-4 right-4 text-champagne" label="Top donor" />}
          <Avatar name={s.donor.displayName} size="lg" className="mt-4" />
          <Link to={paths.profile(s.donor.displayName)} className="mt-3 font-medium text-white hover:text-champagne">
            {s.donor.displayName}
          </Link>
          <p className="mt-1 text-sm text-mist">
            <span className="font-semibold text-champagne tabular-nums">{s.booksDonated}</span> books donated
          </p>
          <BadgeRow badges={s.badges} className="mt-3 justify-center" compact />
        </li>
      ))}
    </ol>
  );
}

function YourStanding({ list }: { list: DonorStanding[] }) {
  const { user } = useSession();
  if (!user || user.isGuest) return null;
  const me = list.find((s) => s.donor.id === user.id);
  const books = me?.booksDonated ?? 0;
  const next = nextBadge(books);
  return (
    <Card tone="gold" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-mist">Your standing</p>
        <p className="mt-1 text-white">
          {me ? (
            <>
              Rank <span className="font-semibold text-champagne">{me.rank}</span> with <span className="font-semibold text-champagne">{books}</span> {books === 1 ? 'book' : 'books'} donated
            </>
          ) : user.showOnHonourBoard ? (
            'You haven’t completed a donation yet.'
          ) : (
            'You’ve chosen not to appear on the Honour Board.'
          )}
        </p>
        {next && <p className="mt-1 text-sm text-muted">{next.threshold - books} more to earn “{next.name}”.</p>}
      </div>
      <ButtonLink to={paths.newDonation} variant="secondary" size="sm">
        Donate a book
      </ButtonLink>
    </Card>
  );
}
