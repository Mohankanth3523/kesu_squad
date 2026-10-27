import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Card, Icon } from '@/components/ui';
import { PriceCalculator } from '@/features/books/PriceCalculator';
import { PricingTable } from '@/features/books/PricingTable';

/**
 * Marketplace & donation rules. Rules are taken from the concept docs (C1 §3, §4, §7).
 * Final wording, plus dispute/refund/fraud guidance, needs owner approval (OQ-35).
 */
export default function RulesPage() {
  return (
    <Container size="narrow" className="pb-12">
      <PageHeader
        title="Marketplace and donation rules"
        description="How buying, selling and donating books works on Kesh Squad."
        above={<Badge tone="info" icon="info">Draft — final wording pending review</Badge>}
      />

      <div className="space-y-12">
        <section aria-labelledby="pricing">
          <h2 id="pricing" className="font-display text-3xl text-white">Fair prices for second-hand books</h2>
          <p className="mt-3 text-mist">
            Every listing has a maximum price based on its edition and age. Sellers can choose any price within that limit.
            Listings show whether a book is the current edition and its publication year, so you can decide with the full picture.
          </p>
          <div className="mt-6">
            <PricingTable />
          </div>
          <p className="mt-3 text-sm text-muted">
            Percentages for editions older than one year are proposals and may change before launch.
          </p>
          <PriceCalculator className="mt-8" />
        </section>

        <section aria-labelledby="donations">
          <h2 id="donations" className="font-display text-3xl text-white">Donating books</h2>
          <ul className="mt-4 space-y-3 text-mist">
            {[
              'Donors can’t charge for donated books.',
              'Recipients pay the agreed delivery cost.',
              'Courier arrangements must be transparent.',
              'Donors may cover shipping if they want to, but don’t have to.',
              'Completed donations count toward the donor’s Honour Board ranking.',
            ].map((rule) => (
              <li key={rule} className="flex gap-3">
                <Icon name="check" size="sm" className="mt-1 text-gold" />
                {rule}
              </li>
            ))}
          </ul>
          <Card tone="gold" className="mt-6">
            <p className="text-white">Example: the courier charge is ₹100. The recipient pays ₹100 and gets the book free.</p>
          </Card>
        </section>

        <section aria-labelledby="payments">
          <h2 id="payments" className="font-display text-3xl text-white">Payments and delivery</h2>
          <p className="mt-3 text-mist">
            Kesh Squad helps you find books and talk privately. It doesn’t collect or process payments. Buyers and sellers arrange
            payment and delivery directly; donation recipients pay only the agreed courier charge.
          </p>
          <p className="mt-3 text-mist">
            Guidance on delivery, payment disputes, refunds and suspected fraud will be published here before launch.
          </p>
        </section>

        <section aria-labelledby="privacy">
          <h2 id="privacy" className="font-display text-3xl text-white">Privacy</h2>
          <ul className="mt-4 space-y-3 text-mist">
            {[
              'Phone numbers are never shown publicly.',
              'Conversations are private to the two people in them.',
              'You choose a display name for anything public.',
              'Report anything that looks like spam or a scam.',
            ].map((rule) => (
              <li key={rule} className="flex gap-3">
                <Icon name="lock" size="sm" className="mt-1 text-gold" />
                {rule}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Container>
  );
}
