import { useId, useState } from 'react';
import { Card, Field, Input, Segmented } from '@/components/ui';
import { priceCapFor } from '@/domain/validation';
import { formatINR } from '@/lib/format';
import { PRICING_RULES } from '@/lib/pricing';
import { cn } from '@/lib/cn';

/** Stand-alone fair-price calculator (C1 §3). Same rule the listing form and the server use. */
export function PriceCalculator({ className }: { className?: string }) {
  const thisYear = new Date().getFullYear();
  const [original, setOriginal] = useState('1000');
  const [edition, setEdition] = useState<'current' | 'older'>('current');
  const [year, setYear] = useState(String(thisYear - 2));
  const resultId = useId();
  const result = priceCapFor({ originalPrice: original, isCurrentEdition: edition === 'current', publicationYear: edition === 'current' ? String(thisYear) : year });

  return (
    <Card tone="gold" className={className}>
      <h2 className="font-display text-2xl text-white">Price calculator</h2>
      <p className="mt-1 text-sm text-mist">Find the most you can ask for a second-hand book.</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Printed price" hint="The price printed on the book.">
          {(p) => <Input {...p} prefix="₹" inputMode="numeric" value={original} onChange={(e) => setOriginal(e.target.value.replace(/\D/g, '').slice(0, 6))} aria-controls={resultId} />}
        </Field>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-white" id={`${resultId}-ed`}>
            Edition
          </span>
          <Segmented
            label="Edition"
            value={edition}
            onChange={setEdition}
            options={[
              { value: 'current', label: 'Current' },
              { value: 'older', label: 'Older' },
            ]}
          />
        </div>
        {edition === 'older' && (
          <Field label="Publication year" hint="As printed inside the book.">
            {(p) => <Input {...p} inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} />}
          </Field>
        )}
      </div>
      <div id={resultId} aria-live="polite" className="mt-6 rounded-[var(--radius-field)] border border-line bg-ink-raised p-4">
        {result ? (
          <>
            <p className="text-sm text-mist">{result.rule.label}</p>
            <p className="mt-1 text-3xl font-semibold text-champagne tabular-nums">Up to {formatINR(result.cap)}</p>
            <p className="mt-1 text-xs text-muted">
              {result.rule.maxPercent}% of {formatINR(result.original)}
              {result.rule.status === 'proposed' && ' · proposed rate, may change before launch'}
            </p>
          </>
        ) : (
          <p className="text-sm text-mist">Enter a printed price{edition === 'older' ? ' and a publication year' : ''} to see the maximum.</p>
        )}
      </div>
      <ul className="mt-4 grid grid-cols-5 gap-1 text-center text-2xs text-muted" aria-label="All price bands">
        {PRICING_RULES.map((r) => (
          <li key={r.id} className={cn('rounded-md px-1 py-1.5', result?.rule.id === r.id && 'bg-gold/12 text-champagne')}>
            <span className="block text-sm font-semibold tabular-nums">{r.maxPercent}%</span>
            {r.isCurrentEdition ? 'Current' : r.maxAge === null ? `${r.minAge}+ yrs` : r.minAge === 0 ? '≤1 yr' : `${r.minAge}–${r.maxAge} yrs`}
          </li>
        ))}
      </ul>
    </Card>
  );
}
