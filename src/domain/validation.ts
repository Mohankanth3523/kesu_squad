import { findPricingRule, maxAllowedPrice } from '@/lib/pricing';
import type { BookCondition, Course, PostCategory } from '@/types/domain';
import { LIMITS, RESERVED_NAMES } from './constants';

/**
 * Validation shared by forms (instant feedback) and mock services (server-style checks).
 * Supabase constraints and triggers enforce the same rules in Milestone B.
 */
export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

export const hasErrors = (errors: FieldErrors) => Object.values(errors).some(Boolean);

function lengthError(label: string, value: string, min: number, max: number): string | undefined {
  const len = value.trim().length;
  if (len < min) return min <= 1 ? `${label} is required.` : `${label} needs at least ${min} characters.`;
  if (len > max) return `${label} can be at most ${max.toLocaleString('en-IN')} characters (currently ${len.toLocaleString('en-IN')}).`;
  return undefined;
}

// Profile ---------------------------------------------------------------
export function validateDisplayName(name: string): string | undefined {
  const value = name.trim();
  const { min, max } = LIMITS.displayName;
  if (value.length < min || value.length > max) return `Use ${min}–${max} characters.`;
  if (!/^[A-Za-z0-9_. -]+$/.test(value)) return 'Use letters, numbers, spaces, dots, dashes or underscores only.';
  if (RESERVED_NAMES.includes(value.toLowerCase().replace(/\s+/g, ''))) return 'That name is reserved. Choose another.';
  return undefined;
}

export function validateEmail(email: string): string | undefined {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ? undefined : 'Enter a valid email address, like name@example.com.';
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Include at least one letter and one number.';
  return undefined;
}

// Community -------------------------------------------------------------
export interface PostInput {
  title: string;
  body: string;
  category: PostCategory | '';
}

export function validatePost(input: PostInput): FieldErrors<keyof PostInput> {
  return {
    title: lengthError('Title', input.title, LIMITS.postTitle.min, LIMITS.postTitle.max),
    body: lengthError('Post', input.body, LIMITS.postBody.min, LIMITS.postBody.max),
    category: input.category ? undefined : 'Choose a category.',
  };
}

export function validateComment(body: string): string | undefined {
  return lengthError('Comment', body, LIMITS.comment.min, LIMITS.comment.max);
}

export function validateMessage(body: string): string | undefined {
  return lengthError('Message', body, LIMITS.message.min, LIMITS.message.max);
}

export function validateAmaQuestion(body: string): string | undefined {
  return lengthError('Question', body, LIMITS.amaQuestion.min, LIMITS.amaQuestion.max);
}

// Books -----------------------------------------------------------------
export interface BookFields {
  title: string;
  author: string;
  editionLabel: string;
  isCurrentEdition: boolean | null;
  publicationYear: string;
  subject: string;
  course: Course[];
  condition: BookCondition | '';
  description: string;
  city: string;
}

export interface SaleFields extends BookFields {
  originalPrice: string;
  askingPrice: string;
}

export interface DonationFields extends BookFields {
  quantity: string;
  donorCoversShipping: boolean;
}

const toInt = (v: string) => (/^\d+$/.test(v.trim()) ? Number(v.trim()) : NaN);

function validateBookFields(input: BookFields, currentYear: number): FieldErrors<keyof BookFields> {
  const year = toInt(input.publicationYear);
  return {
    title: lengthError('Book name', input.title, LIMITS.bookTitle.min, LIMITS.bookTitle.max),
    author: lengthError('Author', input.author, LIMITS.author.min, LIMITS.author.max),
    editionLabel: lengthError('Edition', input.editionLabel, LIMITS.editionLabel.min, LIMITS.editionLabel.max),
    isCurrentEdition: input.isCurrentEdition === null ? 'Tell buyers whether this is the current edition.' : undefined,
    publicationYear: Number.isNaN(year)
      ? 'Enter the year printed in the book, like 2022.'
      : year < LIMITS.publicationYearMin || year > currentYear
        ? `Enter a year between ${LIMITS.publicationYearMin} and ${currentYear}.`
        : undefined,
    subject: input.subject ? undefined : 'Choose a subject.',
    course: input.course.length ? undefined : 'Choose at least one course.',
    condition: input.condition ? undefined : 'Choose the book’s condition.',
    description: input.description.length > LIMITS.description.max ? `Keep the description under ${LIMITS.description.max.toLocaleString('en-IN')} characters.` : undefined,
    city: input.city.length > LIMITS.city.max ? `Keep the city under ${LIMITS.city.max} characters.` : undefined,
  };
}

/** Returns the cap for the given fields, or null when inputs aren't complete yet. */
export function priceCapFor(fields: Pick<SaleFields, 'originalPrice' | 'isCurrentEdition' | 'publicationYear'>, currentYear = new Date().getFullYear()) {
  const original = toInt(fields.originalPrice);
  const year = toInt(fields.publicationYear);
  if (fields.isCurrentEdition === null || Number.isNaN(original) || original < 1) return null;
  if (!fields.isCurrentEdition && (Number.isNaN(year) || year < LIMITS.publicationYearMin || year > currentYear)) return null;
  const rule = findPricingRule(fields.isCurrentEdition, Number.isNaN(year) ? currentYear : year, currentYear);
  return { rule, cap: maxAllowedPrice(original, rule), original };
}

export function validateSale(input: SaleFields, currentYear = new Date().getFullYear()): FieldErrors<keyof SaleFields> {
  const errors: FieldErrors<keyof SaleFields> = validateBookFields(input, currentYear);
  const original = toInt(input.originalPrice);
  const asking = toInt(input.askingPrice);
  errors.originalPrice = Number.isNaN(original)
    ? 'Enter the price printed on the book, in whole rupees.'
    : original < LIMITS.originalPrice.min || original > LIMITS.originalPrice.max
      ? `Enter a printed price between ₹${LIMITS.originalPrice.min} and ₹${LIMITS.originalPrice.max.toLocaleString('en-IN')}.`
      : undefined;
  const cap = priceCapFor(input, currentYear);
  if (Number.isNaN(asking) || asking < 1) {
    errors.askingPrice = 'Enter your selling price in whole rupees.';
  } else if (cap && asking > cap.cap) {
    // Price equal to the cap is allowed (OQ-21 default).
    errors.askingPrice = `The most you can ask for a ${cap.rule.label.toLowerCase()} is ₹${cap.cap.toLocaleString('en-IN')}.`;
  }
  return errors;
}

export function validateDonation(input: DonationFields, currentYear = new Date().getFullYear()): FieldErrors<keyof DonationFields> {
  const errors: FieldErrors<keyof DonationFields> = validateBookFields(input, currentYear);
  const qty = toInt(input.quantity);
  errors.quantity =
    Number.isNaN(qty) || qty < LIMITS.quantity.min || qty > LIMITS.quantity.max
      ? `Enter how many books, from ${LIMITS.quantity.min} to ${LIMITS.quantity.max}.`
      : undefined;
  return errors;
}

export function validateCourierCharge(value: string, donorCovers: boolean): string | undefined {
  if (donorCovers) return undefined;
  const n = toInt(value);
  if (Number.isNaN(n)) return 'Enter the agreed courier charge in whole rupees, or tick “I’ll cover shipping”.';
  if (n < LIMITS.courierCharge.min || n > LIMITS.courierCharge.max) return `Enter an amount up to ₹${LIMITS.courierCharge.max.toLocaleString('en-IN')}.`;
  return undefined;
}

export { toInt };
