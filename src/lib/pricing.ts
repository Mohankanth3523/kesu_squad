/**
 * Maximum selling price rules (C1 §3).
 *
 * Only the current-edition rule (75%) is final in the concept docs. The other
 * bands are marked "proposed" in the source, and the 6+ band is written as a
 * 10–20% range. Until OQ-41 / OQ-42 are answered, the prototype uses 20% for
 * 6+ years and measures age as (current year − publication year).
 * In Milestone B these rules move to the `pricing_rules` table.
 */
export interface PricingRule {
  id: string;
  label: string;
  isCurrentEdition: boolean;
  minAge: number | null;
  maxAge: number | null;
  maxPercent: number;
  status: 'final' | 'proposed';
}

export const PRICING_RULES: PricingRule[] = [
  { id: 'current', label: 'Current / newest edition', isCurrentEdition: true, minAge: null, maxAge: null, maxPercent: 75, status: 'final' },
  { id: 'age-1', label: '1-year-old edition', isCurrentEdition: false, minAge: 0, maxAge: 1, maxPercent: 50, status: 'proposed' },
  { id: 'age-2-3', label: '2–3-year-old edition', isCurrentEdition: false, minAge: 2, maxAge: 3, maxPercent: 40, status: 'proposed' },
  { id: 'age-4-5', label: '4–5-year-old edition', isCurrentEdition: false, minAge: 4, maxAge: 5, maxPercent: 25, status: 'proposed' },
  { id: 'age-6-plus', label: '6+ years old', isCurrentEdition: false, minAge: 6, maxAge: null, maxPercent: 20, status: 'proposed' },
];

export function findPricingRule(
  isCurrentEdition: boolean,
  publicationYear: number,
  currentYear: number = new Date().getFullYear(),
): PricingRule {
  if (isCurrentEdition) return PRICING_RULES[0]!;
  const age = Math.max(0, currentYear - publicationYear);
  const rule = PRICING_RULES.find(
    (r) => !r.isCurrentEdition && r.minAge !== null && age >= r.minAge && (r.maxAge === null || age <= r.maxAge),
  );
  return rule ?? PRICING_RULES[PRICING_RULES.length - 1]!;
}

/** Cap rounded down to the rupee (rounding rule pending OQ-42). */
export function maxAllowedPrice(originalPrice: number, rule: PricingRule): number {
  return Math.floor((originalPrice * rule.maxPercent) / 100);
}
