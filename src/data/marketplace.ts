import { findPricingRule, maxAllowedPrice } from '@/lib/pricing';
import type { BookCondition, Course } from '@/types/domain';
import type {
  DbCompletion,
  DbConversation,
  DbDonationListing,
  DbDonationRequest,
  DbMessage,
  DbParticipantState,
  DbSaleListing,
} from './schema';
import { daysAgo, hoursAgo, minutesAgo, THIS_YEAR } from './time';

interface BookSeed {
  id: string;
  ownerId: string;
  title: string;
  author: string;
  subject: string;
  course: Course[];
  current: boolean;
  /** Years since publication. */
  age: number;
  condition: BookCondition;
  city: string;
  listedDaysAgo: number;
  description?: string;
}

const editionLabel = (current: boolean, age: number) =>
  current ? 'Latest edition' : age <= 3 ? 'Previous edition' : 'Older edition';

function sale(seed: BookSeed & { originalPrice: number; askingPrice: number; status?: DbSaleListing['status'] }): DbSaleListing {
  const publicationYear = THIS_YEAR - seed.age;
  const rule = findPricingRule(seed.current, publicationYear, THIS_YEAR);
  const cap = maxAllowedPrice(seed.originalPrice, rule);
  if (seed.askingPrice > cap) throw new Error(`Fixture ${seed.id} breaks the price cap (${seed.askingPrice} > ${cap}).`);
  const created = daysAgo(seed.listedDaysAgo);
  return {
    type: 'sale',
    id: seed.id,
    ownerId: seed.ownerId,
    title: seed.title,
    author: seed.author,
    editionLabel: editionLabel(seed.current, seed.age),
    isCurrentEdition: seed.current,
    publicationYear,
    subject: seed.subject,
    course: seed.course,
    condition: seed.condition,
    description: seed.description,
    photos: [],
    city: seed.city,
    status: seed.status ?? 'available',
    createdAt: created,
    updatedAt: created,
    originalPrice: seed.originalPrice,
    askingPrice: seed.askingPrice,
    maxAllowedPrice: cap,
    pricingRuleLabel: rule.label,
  };
}

function donation(seed: BookSeed & { quantity?: number; donorCoversShipping?: boolean; status?: DbDonationListing['status'] }): DbDonationListing {
  const created = daysAgo(seed.listedDaysAgo);
  return {
    type: 'donation',
    id: seed.id,
    ownerId: seed.ownerId,
    title: seed.title,
    author: seed.author,
    editionLabel: editionLabel(seed.current, seed.age),
    isCurrentEdition: seed.current,
    publicationYear: THIS_YEAR - seed.age,
    subject: seed.subject,
    course: seed.course,
    condition: seed.condition,
    description: seed.description,
    photos: [],
    city: seed.city,
    status: seed.status ?? 'available',
    createdAt: created,
    updatedAt: created,
    quantity: seed.quantity ?? 1,
    donorCoversShipping: seed.donorCoversShipping ?? false,
  };
}

export const seedSaleListings: DbSaleListing[] = [
  sale({ id: 'b1', ownerId: 'u-tanvi', title: 'Human Anatomy, Vol. 1 — Upper Limb and Thorax', author: 'B D Chaurasia', subject: 'Anatomy', course: ['MBBS', 'BDS'], current: true, age: 1, condition: 'good', city: 'Pune', listedDaysAgo: 0.1, originalPrice: 995, askingPrice: 650, description: 'Pencil marks in the brachial plexus chapter, otherwise clean. All diagrams intact.' }),
  sale({ id: 'b2', ownerId: 'u-aftab', title: 'Textbook of Medical Physiology', author: 'Guyton and Hall', subject: 'Physiology', course: ['MBBS'], current: false, age: 3, condition: 'like_new', city: 'Hyderabad', listedDaysAgo: 0.4, originalPrice: 1650, askingPrice: 620, description: 'Bought it, used it twice, switched to my senior’s notes. Spine is perfect.' }),
  sale({ id: 'b3', ownerId: 'u-nikhil', title: 'Essentials of Medical Pharmacology', author: 'K D Tripathi', subject: 'Pharmacology', course: ['MBBS', 'BDS'], current: true, age: 1, condition: 'fair', city: 'Chennai', listedDaysAgo: 1, originalPrice: 1495, askingPrice: 950, description: 'Highlighted in yellow throughout. Some people like that.' }),
  sale({ id: 'b4', ownerId: 'u-meera', title: 'Textbook of Oral Pathology', author: 'Shafer, Hine and Levy', subject: 'Oral Pathology', course: ['BDS'], current: false, age: 5, condition: 'good', city: 'Bengaluru', listedDaysAgo: 2, originalPrice: 2100, askingPrice: 480 }),
  sale({ id: 'b5', ownerId: 'u-priya', title: 'Robbins and Cotran Pathologic Basis of Disease', author: 'Kumar, Abbas and Aster', subject: 'Pathology', course: ['MBBS'], current: true, age: 2, condition: 'like_new', city: 'Mumbai', listedDaysAgo: 2.5, originalPrice: 3295, askingPrice: 2200, description: 'South Asia edition. No highlighting. Selling because I switched to a smaller book for revision.' }),
  sale({ id: 'b6', ownerId: 'u-demo', title: 'Textbook of Biochemistry for Medical Students', author: 'D M Vasudevan', subject: 'Biochemistry', course: ['MBBS', 'BDS'], current: false, age: 2, condition: 'good', city: 'Kochi', listedDaysAgo: 3, originalPrice: 1395, askingPrice: 500, description: 'Clean copy with a few sticky notes I’ll remove before handing over.' }),
  sale({ id: 'b7', ownerId: 'u-kabir', title: 'Textbook of Microbiology', author: 'Ananthanarayan and Paniker', subject: 'Microbiology', course: ['MBBS', 'BDS'], current: true, age: 1, condition: 'good', city: 'New Delhi', listedDaysAgo: 3.5, originalPrice: 1250, askingPrice: 800 }),
  sale({ id: 'b8', ownerId: 'u-joel', title: 'Essentials of Forensic Medicine and Toxicology', author: 'K S Narayan Reddy', subject: 'Forensic Medicine', course: ['MBBS'], current: false, age: 7, condition: 'fair', city: 'Lucknow', listedDaysAgo: 4, originalPrice: 895, askingPrice: 150 }),
  sale({ id: 'b9', ownerId: 'u-arjun', title: 'Textbook of Prosthodontics', author: 'Deepak Nallaswamy', subject: 'Prosthodontics', course: ['BDS'], current: true, age: 1, condition: 'like_new', city: 'Chennai', listedDaysAgo: 5, originalPrice: 2450, askingPrice: 1500 }),
  sale({ id: 'b10', ownerId: 'u-zoya', title: 'Sturdevant’s Art and Science of Operative Dentistry', author: 'Ritter, Boushell and Walter', subject: 'Conservative Dentistry', course: ['BDS'], current: false, age: 4, condition: 'good', city: 'Bengaluru', listedDaysAgo: 6, originalPrice: 3100, askingPrice: 700 }),
  sale({ id: 'b11', ownerId: 'u-ria', title: 'DC Dutta’s Textbook of Obstetrics', author: 'Hiralal Konar', subject: 'Obstetrics & Gynaecology', course: ['MBBS'], current: true, age: 1, condition: 'good', city: 'Jaipur', listedDaysAgo: 7, originalPrice: 1595, askingPrice: 1000 }),
  sale({ id: 'b12', ownerId: 'u-demo', title: 'Ghai Essential Pediatrics', author: 'Vinod K Paul and Arvind Bagga', subject: 'Paediatrics', course: ['MBBS'], current: false, age: 3, condition: 'good', city: 'Kochi', listedDaysAgo: 9, originalPrice: 1495, askingPrice: 550, status: 'reserved' }),
  sale({ id: 'b13', ownerId: 'u-sahil', title: 'Bailey and Love’s Short Practice of Surgery', author: 'Williams, O’Connell and McCaskie', subject: 'General Surgery', course: ['MBBS'], current: false, age: 5, condition: 'fair', city: 'Hyderabad', listedDaysAgo: 10, originalPrice: 4500, askingPrice: 950, description: 'Heavy book, so local pickup preferred. Courier possible if you cover it.' }),
  sale({ id: 'b14', ownerId: 'u-priya', title: 'Comprehensive Ophthalmology', author: 'A K Khurana', subject: 'Ophthalmology', course: ['MBBS'], current: true, age: 1, condition: 'like_new', city: 'Mumbai', listedDaysAgo: 12, originalPrice: 1295, askingPrice: 900 }),
  sale({ id: 'b15', ownerId: 'u-nikhil', title: 'Diseases of Ear, Nose and Throat', author: 'P L Dhingra', subject: 'ENT', course: ['MBBS'], current: false, age: 2, condition: 'good', city: 'Chennai', listedDaysAgo: 14, originalPrice: 1095, askingPrice: 400 }),
  sale({ id: 'b16', ownerId: 'u-arjun', title: 'Orban’s Oral Histology and Embryology', author: 'G S Kumar', subject: 'Dental Anatomy', course: ['BDS'], current: false, age: 6, condition: 'heavily_used', city: 'Indore', listedDaysAgo: 16, originalPrice: 1450, askingPrice: 250 }),
  sale({ id: 'b17', ownerId: 'u-tanvi', title: 'Textbook of Medical Physiology', author: 'A K Jain', subject: 'Physiology', course: ['MBBS', 'BDS'], current: false, age: 4, condition: 'fair', city: 'Pune', listedDaysAgo: 20, originalPrice: 1350, askingPrice: 300, status: 'sold' }),
];

export const seedDonationListings: DbDonationListing[] = [
  donation({ id: 'd1', ownerId: 'u-joel', title: 'Park’s Textbook of Preventive and Social Medicine', author: 'K Park', subject: 'Community Medicine', course: ['MBBS'], current: false, age: 4, condition: 'fair', city: 'Kochi', listedDaysAgo: 0.3, description: 'Some pages dog-eared, all there. Happy for it to go to someone who needs it.' }),
  donation({ id: 'd2', ownerId: 'u-dent', title: 'Wheeler’s Dental Anatomy, Physiology and Occlusion', author: 'Nelson', subject: 'Dental Anatomy', course: ['BDS'], current: false, age: 6, condition: 'good', city: 'Lucknow', listedDaysAgo: 1, donorCoversShipping: true, description: 'I’ll cover the courier for this one.' }),
  donation({ id: 'd3', ownerId: 'u-ria', title: 'First-year MBBS set: Anatomy, Physiology and Biochemistry', author: 'Various authors', subject: 'Anatomy', course: ['MBBS'], current: false, age: 3, condition: 'heavily_used', city: 'Jaipur', listedDaysAgo: 4, quantity: 3, description: 'Three books, well loved and full of notes. You can request one or all three.' }),
  donation({ id: 'd4', ownerId: 'u-kabir', title: 'Textbook of Physiology', author: 'A K Jain', subject: 'Physiology', course: ['MBBS', 'BDS'], current: false, age: 5, condition: 'good', city: 'New Delhi', listedDaysAgo: 5 }),
  donation({ id: 'd5', ownerId: 'u-zoya', title: 'Textbook of Dental Materials', author: 'John J Manappallil', subject: 'Dental Materials', course: ['BDS'], current: false, age: 4, condition: 'good', city: 'Chennai', listedDaysAgo: 7, donorCoversShipping: true }),
  donation({ id: 'd6', ownerId: 'u-demo', title: 'Essentials of Medical Pharmacology', author: 'K D Tripathi', subject: 'Pharmacology', course: ['MBBS', 'BDS'], current: false, age: 6, condition: 'fair', city: 'Kochi', listedDaysAgo: 8, description: 'Older edition with my notes in the margins. Still useful for basics.' }),
  donation({ id: 'd7', ownerId: 'u-priya', title: 'Textbook of Pathology', author: 'Harsh Mohan', subject: 'Pathology', course: ['MBBS', 'BDS'], current: false, age: 4, condition: 'good', city: 'Mumbai', listedDaysAgo: 11, status: 'reserved' }),
  donation({ id: 'd8', ownerId: 'u-sahil', title: 'Hutchison’s Clinical Methods', author: 'Glynn and Drake', subject: 'General Medicine', course: ['MBBS'], current: false, age: 7, condition: 'fair', city: 'Hyderabad', listedDaysAgo: 13 }),
];

// Conversations ---------------------------------------------------------
const conv = (id: string, kind: DbConversation['kind'], listingId: string, initiatorId: string, ownerId: string, createdAt: string): DbConversation => ({ id, kind, listingId, initiatorId, ownerId, createdAt });

export const seedConversations: DbConversation[] = [
  conv('k1', 'sale', 'b2', 'u-demo', 'u-aftab', daysAgo(0.3)),
  conv('k2', 'sale', 'b6', 'u-kabir', 'u-demo', daysAgo(1)),
  conv('k3', 'sale', 'b12', 'u-arjun', 'u-demo', daysAgo(6)),
  conv('k4', 'sale', 'b5', 'u-demo', 'u-priya', daysAgo(2)),
  conv('k5', 'donation', 'd6', 'u-sahil', 'u-demo', daysAgo(2)),
  conv('k6', 'donation', 'd6', 'u-tanvi', 'u-demo', daysAgo(1)),
  conv('k7', 'donation', 'd7', 'u-demo', 'u-priya', daysAgo(9)),
  conv('k8', 'donation', 'd1', 'u-demo', 'u-joel', hoursAgo(5)),
  // Between two other members: never visible to the demo user (privacy check).
  conv('k9', 'sale', 'b3', 'u-sahil', 'u-nikhil', daysAgo(1)),
];

let messageSeq = 0;
const msg = (conversationId: string, senderId: string | null, body: string, createdAt: string): DbMessage => ({
  id: `m${++messageSeq}`,
  conversationId,
  senderId,
  body,
  kind: senderId ? 'user' : 'system',
  createdAt,
});

export const seedMessages: DbMessage[] = [
  msg('k1', 'u-demo', 'Hi! Is the Guyton still available?', minutesAgo(400)),
  msg('k1', 'u-aftab', 'Yes it is. Practically new — I can share more photos if you want.', minutesAgo(380)),
  msg('k1', 'u-demo', 'That would help. Could you show the index pages?', minutesAgo(375)),
  msg('k1', 'u-aftab', 'Sure, sending them in a bit. Are you in Hyderabad or would it need a courier?', minutesAgo(40)),

  msg('k2', 'u-kabir', 'Hello, I’m interested in the Vasudevan. Would you take ₹450?', daysAgo(1)),
  msg('k2', 'u-demo', 'Hi Kabir — I can do ₹480 if you’re okay with paying the courier.', hoursAgo(20)),
  msg('k2', 'u-kabir', 'Deal. How do we arrange the courier?', minutesAgo(25)),

  msg('k3', 'u-arjun', 'Hi, is Ghai still available for a friend of mine?', daysAgo(6)),
  msg('k3', 'u-demo', 'Yes. I’ve marked it reserved for you for this week.', daysAgo(5)),
  msg('k3', 'u-arjun', 'Thanks! She’ll message you on Saturday.', daysAgo(5)),

  msg('k4', 'u-demo', 'Hi Priya, does the Robbins have any highlighting?', daysAgo(2)),
  msg('k4', 'u-priya', 'None at all. I used it with sticky tabs only.', daysAgo(2)),

  msg('k5', 'u-sahil', 'Hi! I’d love the pharmacology book for my second-year revision. I can pay the courier.', daysAgo(2)),
  msg('k5', 'u-demo', 'Sure — which city are you in?', daysAgo(2)),
  msg('k5', 'u-sahil', 'Hyderabad. India Post usually works fine for me.', hoursAgo(30)),

  msg('k6', 'u-tanvi', 'Hello! If it’s still free, I’d really appreciate it. I can cover the courier.', daysAgo(1)),

  msg('k7', 'u-demo', 'Hi Priya, I’d love the Harsh Mohan if it’s still available.', daysAgo(9)),
  msg('k7', 'u-priya', 'It’s yours. Courier to Kochi will be about ₹90 — is that okay?', daysAgo(8)),
  msg('k7', 'u-demo', 'Perfect, thank you!', daysAgo(8)),
  msg('k7', null, 'Priya accepted the request. Agreed courier charge: ₹90, paid by the recipient.', daysAgo(8)),
  msg('k7', null, 'Priya marked the book as sent.', daysAgo(2)),
  msg('k7', 'u-priya', 'Sent it today! Tracking number is in the courier receipt — let me know when it arrives.', daysAgo(2)),

  msg('k8', 'u-demo', 'Hi Joel, could I request the Park PSM? I’m in Kochi too.', hoursAgo(5)),

  msg('k9', 'u-sahil', 'Is the KDT negotiable?', daysAgo(1)),
  msg('k9', 'u-nikhil', 'A little. ₹900 is my best.', hoursAgo(22)),
];

/** Read markers: the demo user has unread messages in k1 and k2. */
export const seedParticipants: DbParticipantState[] = seedConversations.flatMap((c) => {
  const latest = seedMessages.filter((m) => m.conversationId === c.id).at(-1)?.createdAt ?? c.createdAt;
  const unreadForDemo = c.id === 'k1' || c.id === 'k2';
  return [c.initiatorId, c.ownerId].map((userId) => ({
    conversationId: c.id,
    userId,
    lastReadAt: userId === 'u-demo' && unreadForDemo ? minutesAgo(370) : latest,
    blocked: false,
  }));
});

// Donation requests -----------------------------------------------------
export const seedDonationRequests: DbDonationRequest[] = [
  { id: 'q1', listingId: 'd6', requesterId: 'u-sahil', conversationId: 'k5', message: 'I’d love this for my second-year revision. I can pay the courier.', booksRequested: 1, status: 'pending', createdAt: daysAgo(2) },
  { id: 'q2', listingId: 'd6', requesterId: 'u-tanvi', conversationId: 'k6', message: 'If it’s still free, I’d really appreciate it. I can cover the courier.', booksRequested: 1, status: 'pending', createdAt: daysAgo(1) },
  { id: 'q3', listingId: 'd7', requesterId: 'u-demo', conversationId: 'k7', message: 'I’d love the Harsh Mohan for my pathology prep.', booksRequested: 1, status: 'accepted', agreedCourierCharge: 90, donorCoversShipping: false, createdAt: daysAgo(9), acceptedAt: daysAgo(8), donorConfirmedAt: daysAgo(2) },
  { id: 'q4', listingId: 'd1', requesterId: 'u-demo', conversationId: 'k8', message: 'Could I request the Park PSM? I’m in Kochi too.', booksRequested: 1, status: 'pending', createdAt: hoursAgo(5) },
];

// Honour Board ledger -----------------------------------------------------
/** Completed donations by fictional members. Counts are illustrative (PRD HON-11). */
const ledger: Array<[donorId: string, books: number[], lastDaysAgo: number]> = [
  ['u-ria', [3, 2, 1, 1, 4, 1, 2, 1, 1, 3, 1, 2, 1, 1, 1], 4],
  ['u-dent', [2, 1, 1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 1], 6],
  ['u-joel', [1, 2, 1, 1, 3, 1, 1, 2], 3],
  ['u-tanvi', [2, 1, 1, 1, 3, 1], 11],
  ['u-nikhil', [1, 1, 2, 1, 1], 9],
  ['u-priya', [1, 2, 1], 15],
  ['u-zoya', [1, 1, 1], 20],
  ['u-kabir', [2], 25],
  ['u-demo', [1], 14],
];

export const seedCompletions: DbCompletion[] = ledger.flatMap(([donorId, books, lastDaysAgo]) =>
  books.map((booksCount, i) => ({
    id: `x-${donorId}-${i}`,
    requestId: null,
    donorId,
    booksCount,
    completedAt: daysAgo(lastDaysAgo + (books.length - 1 - i) * 9),
  })),
);
