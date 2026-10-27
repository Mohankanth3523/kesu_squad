import { useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Button, Card, CharCount, Checkbox, Field, Icon, Input, Segmented, Select, Textarea } from '@/components/ui';
import { ALL_SUBJECTS, COURSES, LIMITS, SUBJECTS } from '@/domain/constants';
import {
  hasErrors,
  priceCapFor,
  toInt,
  validateDonation,
  validateSale,
  type BookFields,
  type DonationFields,
  type FieldErrors,
  type SaleFields,
} from '@/domain/validation';
import { cn } from '@/lib/cn';
import { formatINR } from '@/lib/format';
import type { DonationInput, SaleInput } from '@/services/interfaces';
import type { BookCondition, Course, DonationListing, ListingPhoto, SaleListing } from '@/types/domain';
import { CONDITION_HINT, CONDITION_LABEL } from '@/types/labels';
import { PhotoPicker } from './PhotoPicker';

type AllFields = SaleFields & DonationFields;

const CONDITIONS: BookCondition[] = ['like_new', 'good', 'fair', 'heavily_used'];

function initialFields(existing?: SaleListing | DonationListing): AllFields {
  return {
    title: existing?.title ?? '',
    author: existing?.author ?? '',
    editionLabel: existing?.editionLabel ?? '',
    isCurrentEdition: existing ? existing.isCurrentEdition : null,
    publicationYear: existing ? String(existing.publicationYear) : '',
    subject: existing?.subject ?? '',
    course: existing?.course ?? [],
    condition: existing?.condition ?? '',
    description: existing?.description ?? '',
    city: existing?.city ?? '',
    originalPrice: existing?.type === 'sale' ? String(existing.originalPrice) : '',
    askingPrice: existing?.type === 'sale' ? String(existing.askingPrice) : '',
    quantity: existing?.type === 'donation' ? String(existing.quantity) : '1',
    donorCoversShipping: existing?.type === 'donation' ? existing.donorCoversShipping : false,
  };
}

function toBookInput(f: BookFields, photos: ListingPhoto[]) {
  return {
    title: f.title.trim(),
    author: f.author.trim(),
    editionLabel: f.editionLabel.trim(),
    isCurrentEdition: Boolean(f.isCurrentEdition),
    publicationYear: toInt(f.publicationYear),
    subject: f.subject,
    course: f.course,
    condition: f.condition as BookCondition,
    description: f.description.trim() || undefined,
    city: f.city.trim() || undefined,
    photos,
  };
}

export type BookFormProps =
  | {
      mode: 'sale';
      existing?: SaleListing;
      submitLabel: string;
      onSubmit: (input: SaleInput) => Promise<Record<string, string> | void>;
      onCancel?: () => void;
    }
  | {
      mode: 'donation';
      existing?: DonationListing;
      submitLabel: string;
      onSubmit: (input: DonationInput) => Promise<Record<string, string> | void>;
      onCancel?: () => void;
    };

/** Listing form shared by Sell and Donate (C1 §3, §4). */
export function BookForm(props: BookFormProps) {
  const { mode, submitLabel, onCancel } = props;
  const [f, setF] = useState<AllFields>(() => initialFields(props.existing));
  const [photos, setPhotos] = useState<ListingPhoto[]>(props.existing?.photos ?? []);
  const [touched, setTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const thisYear = new Date().getFullYear();

  const set = <K extends keyof AllFields>(key: K, value: AllFields[K]) => {
    setF((prev) => ({ ...prev, [key]: value }));
    setServerErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const clientErrors: FieldErrors<keyof AllFields> = useMemo(
    () => (mode === 'sale' ? validateSale(f, thisYear) : validateDonation(f, thisYear)),
    [f, mode, thisYear],
  );
  const errorFor = (key: keyof AllFields | 'photos') => serverErrors[key] || (touched ? clientErrors[key as keyof AllFields] : undefined);

  const subjects = f.course.length === 1 ? SUBJECTS[f.course[0] as Course] : ALL_SUBJECTS;
  const cap = mode === 'sale' ? priceCapFor(f, thisYear) : null;
  const asking = toInt(f.askingPrice);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors(clientErrors)) {
      // Move focus to the first invalid field so keyboard and screen-reader users land on it.
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setSubmitting(true);
    const base = toBookInput(f, photos);
    const result =
      props.mode === 'sale'
        ? await props.onSubmit({ ...base, originalPrice: toInt(f.originalPrice), askingPrice: toInt(f.askingPrice) })
        : await props.onSubmit({ ...base, quantity: toInt(f.quantity), donorCoversShipping: f.donorCoversShipping });
    setSubmitting(false);
    if (result) setServerErrors(result);
  }

  return (
    <form ref={formRef} noValidate onSubmit={submit} className="space-y-8">
      <FormSection title="The book">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Book name" required error={errorFor('title')} className="sm:col-span-2">
            {(p) => <Input {...p} value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Essentials of Medical Pharmacology" autoComplete="off" />}
          </Field>
          <Field label="Author" required error={errorFor('author')}>
            {(p) => <Input {...p} value={f.author} onChange={(e) => set('author', e.target.value)} placeholder="K D Tripathi" autoComplete="off" />}
          </Field>
          <Field label="Edition" required hint="As printed, e.g. “8th edition”." error={errorFor('editionLabel')}>
            {(p) => <Input {...p} value={f.editionLabel} onChange={(e) => set('editionLabel', e.target.value)} placeholder="8th edition" autoComplete="off" />}
          </Field>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-white">
              Is this the current edition?<span className="ml-1 text-gold" aria-hidden="true">*</span>
            </span>
            <Segmented
              label="Is this the current edition?"
              value={f.isCurrentEdition === null ? '' : f.isCurrentEdition ? 'yes' : 'no'}
              onChange={(v) => set('isCurrentEdition', v === 'yes')}
              options={[
                { value: 'yes', label: 'Yes, newest edition' },
                { value: 'no', label: 'No, older edition' },
              ]}
            />
            {errorFor('isCurrentEdition') && (
              <p className="text-sm text-danger" role="alert">
                {errorFor('isCurrentEdition')}
              </p>
            )}
          </div>
          <Field label="Publication year" required hint="Printed on the copyright page." error={errorFor('publicationYear')}>
            {(p) => <Input {...p} inputMode="numeric" maxLength={4} value={f.publicationYear} onChange={(e) => set('publicationYear', e.target.value.replace(/\D/g, ''))} placeholder={String(thisYear - 1)} />}
          </Field>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1.5 text-sm font-medium text-white">
              Course<span className="ml-1 text-gold" aria-hidden="true">*</span>
            </legend>
            <div className="flex gap-6">
              {COURSES.map((c) => (
                <Checkbox
                  key={c}
                  label={c}
                  checked={f.course.includes(c)}
                  onChange={(e) => set('course', e.target.checked ? [...f.course, c] : f.course.filter((x) => x !== c))}
                  aria-invalid={errorFor('course') ? true : undefined}
                />
              ))}
            </div>
            {errorFor('course') && (
              <p className="text-sm text-danger" role="alert">
                {errorFor('course')}
              </p>
            )}
          </fieldset>
          <Field label="Subject" required error={errorFor('subject')}>
            {(p) => (
              <Select {...p} value={f.subject} onChange={(e) => set('subject', e.target.value)}>
                <option value="">Choose a subject</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </FormSection>

      <FormSection title="Condition">
        <fieldset>
          <legend className="sr-only">Condition</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {CONDITIONS.map((c) => (
              <label
                key={c}
                className={cn(
                  'flex cursor-pointer gap-3 rounded-[var(--radius-field)] border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-champagne',
                  f.condition === c ? 'border-gold/60 bg-gold/8' : 'border-line hover:border-line-strong',
                )}
              >
                <input type="radio" name="condition" value={c} checked={f.condition === c} onChange={() => set('condition', c)} className="sr-only" />
                <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border', f.condition === c ? 'border-gold' : 'border-line-strong')}>
                  {f.condition === c && <span className="size-2.5 rounded-full bg-gold" />}
                </span>
                <span>
                  <span className="block font-medium text-white">{CONDITION_LABEL[c]}</span>
                  <span className="text-sm text-muted">{CONDITION_HINT[c]}</span>
                </span>
              </label>
            ))}
          </div>
          {errorFor('condition') && (
            <p className="mt-2 text-sm text-danger" role="alert">
              {errorFor('condition')}
            </p>
          )}
        </fieldset>
        <PhotoPicker photos={photos} onChange={setPhotos} bookTitle={f.title} error={serverErrors.photos} />
        <Field
          label="Description (optional)"
          hint={<span className="flex justify-between gap-3"><span>Mention highlighting, notes or missing pages.</span><CharCount value={f.description} max={LIMITS.description.max} /></span>}
          error={errorFor('description')}
        >
          {(p) => <Textarea {...p} value={f.description} onChange={(e) => set('description', e.target.value)} rows={4} />}
        </Field>
        <Field label="City (optional)" hint="Helps with courier or meeting up. Never share your full address publicly." error={errorFor('city')}>
          {(p) => <Input {...p} value={f.city} onChange={(e) => set('city', e.target.value)} placeholder="Pune" autoComplete="address-level2" />}
        </Field>
      </FormSection>

      {mode === 'sale' ? (
        <FormSection title="Price">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Printed price" required hint="The original price printed on the book." error={errorFor('originalPrice')}>
              {(p) => <Input {...p} prefix="₹" inputMode="numeric" value={f.originalPrice} onChange={(e) => set('originalPrice', e.target.value.replace(/\D/g, '').slice(0, 6))} />}
            </Field>
            <Field label="Your price" required error={errorFor('askingPrice')} hint={cap ? `Up to ${formatINR(cap.cap)} for this book.` : 'Fill in the edition, year and printed price to see your limit.'}>
              {(p) => <Input {...p} prefix="₹" inputMode="numeric" value={f.askingPrice} onChange={(e) => set('askingPrice', e.target.value.replace(/\D/g, '').slice(0, 6))} />}
            </Field>
          </div>
          <div aria-live="polite" className="rounded-[var(--radius-field)] border border-line bg-ink-raised p-4">
            {cap ? (
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-mist">Fair-price limit · {cap.rule.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-champagne tabular-nums">Up to {formatINR(cap.cap)}</p>
                  <p className="text-xs text-muted">
                    {cap.rule.maxPercent}% of {formatINR(cap.original)}
                    {cap.rule.status === 'proposed' && ' · proposed rate'}
                  </p>
                </div>
                {!Number.isNaN(asking) && asking > 0 && (
                  <p className={cn('inline-flex items-center gap-1.5 text-sm', asking <= cap.cap ? 'text-success' : 'text-danger')}>
                    <Icon name={asking <= cap.cap ? 'success' : 'error'} size="sm" />
                    {asking <= cap.cap ? `${formatINR(asking)} is within the limit` : `${formatINR(asking - cap.cap)} over the limit`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-mist">Kesh Squad caps second-hand prices by edition age so books stay affordable.</p>
            )}
          </div>
        </FormSection>
      ) : (
        <FormSection title="Giving it away">
          <Card tone="gold" className="flex gap-3">
            <Icon name="free" className="mt-0.5 text-gold" />
            <p className="text-sm text-mist">
              Donated books are always free. The person who receives it pays only the courier charge you both agree on — unless you choose to cover it.
            </p>
          </Card>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Number of books" required hint="For a set, each book counts on the Honour Board." error={errorFor('quantity')}>
              {(p) => <Input {...p} inputMode="numeric" value={f.quantity} onChange={(e) => set('quantity', e.target.value.replace(/\D/g, '').slice(0, 2))} />}
            </Field>
          </div>
          <Checkbox
            label="I’ll cover the courier charge"
            description="Optional. If you don’t, the recipient pays the agreed courier charge."
            checked={f.donorCoversShipping}
            onChange={(e) => set('donorCoversShipping', e.target.checked)}
          />
        </FormSection>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="lg" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
      {touched && hasErrors(clientErrors) && (
        <p className="text-right text-sm text-danger" role="alert">
          Fix the highlighted fields to continue.
        </p>
      )}
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-5">
      <h2 className="font-display text-2xl text-white">{title}</h2>
      {children}
    </section>
  );
}
