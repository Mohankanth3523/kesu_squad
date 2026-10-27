import { Badge } from '@/components/ui';
import { formatINR } from '@/lib/format';
import { maxAllowedPrice, PRICING_RULES } from '@/lib/pricing';

/** Maximum-price table with the ₹1,000 worked example from the concept doc (C1 §3). */
export function PricingTable({ example = 1000 }: { example?: number }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-surface)] border border-line">
      <table className="w-full min-w-[34rem] text-left text-sm">
        <caption className="sr-only">Maximum selling price by edition age</caption>
        <thead className="bg-charcoal text-mist">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Book edition</th>
            <th scope="col" className="px-4 py-3 font-medium">Maximum price</th>
            <th scope="col" className="px-4 py-3 font-medium">On a {formatINR(example)} book</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {PRICING_RULES.map((rule) => (
            <tr key={rule.id}>
              <th scope="row" className="px-4 py-3 font-normal text-white">{rule.label}</th>
              <td className="px-4 py-3 text-champagne tabular-nums">
                {rule.id === 'age-6-plus' ? '10–20% (prototype uses 20%)' : `${rule.maxPercent}% of printed price`}
              </td>
              <td className="px-4 py-3 tabular-nums text-white">{formatINR(maxAllowedPrice(example, rule))}</td>
              <td className="px-4 py-3">
                {rule.status === 'final' ? <Badge tone="success">Final</Badge> : <Badge tone="outline">Proposed</Badge>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
