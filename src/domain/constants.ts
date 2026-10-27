import type { Badge, Course } from '@/types/domain';

/**
 * Prototype defaults for values still open in docs/OPEN_QUESTIONS.md.
 * Each is labelled with its question so it can be changed in one place.
 */
export const LIMITS = {
  displayName: { min: 3, max: 30 },
  postTitle: { min: 5, max: 150 }, // OQ-17
  postBody: { min: 1, max: 10_000 }, // OQ-17
  comment: { min: 1, max: 5_000 }, // OQ-17
  message: { min: 1, max: 2_000 },
  amaQuestion: { min: 10, max: 500 },
  donationRequestMessage: { min: 10, max: 500 },
  bookTitle: { min: 2, max: 200 },
  author: { min: 2, max: 200 },
  description: { max: 2_000 },
  editionLabel: { min: 1, max: 40 },
  city: { max: 60 },
  originalPrice: { min: 1, max: 50_000 }, // OQ-51
  courierCharge: { min: 0, max: 5_000 }, // OQ-51
  photos: { min: 0, max: 6, maxBytes: 5 * 1024 * 1024 }, // OQ-20
  quantity: { min: 1, max: 20 },
  maxCommentDepth: 5,
  amaPerDay: 5,
  pendingDonationRequests: 3, // OQ-32
  publicationYearMin: 1950,
} as const;

export const COURSES: Course[] = ['MBBS', 'BDS'];

/** Subject list pending owner review (OQ-23). */
export const SUBJECTS: Record<Course, string[]> = {
  MBBS: [
    'Anatomy',
    'Physiology',
    'Biochemistry',
    'Pathology',
    'Pharmacology',
    'Microbiology',
    'Forensic Medicine',
    'Community Medicine',
    'Ophthalmology',
    'ENT',
    'General Medicine',
    'General Surgery',
    'Obstetrics & Gynaecology',
    'Paediatrics',
    'Orthopaedics',
    'Dermatology',
    'Psychiatry',
    'Anaesthesia',
    'Radiology',
  ],
  BDS: [
    'Anatomy',
    'Physiology',
    'Biochemistry',
    'Dental Anatomy',
    'Dental Materials',
    'Oral Pathology',
    'Pathology',
    'Microbiology',
    'Pharmacology',
    'General Medicine',
    'General Surgery',
    'Prosthodontics',
    'Conservative Dentistry',
    'Orthodontics',
    'Periodontics',
    'Oral Surgery',
    'Oral Medicine',
    'Paediatric Dentistry',
    'Public Health Dentistry',
  ],
};

export const ALL_SUBJECTS = Array.from(new Set([...SUBJECTS.MBBS, ...SUBJECTS.BDS])).sort((a, b) => a.localeCompare(b));

/** Honour Board badges (C1 §5). Legend threshold pending OQ-33. */
export const BADGES: Badge[] = [
  { id: 'first_contribution', name: 'First Contribution', threshold: 1 },
  { id: 'five_books', name: '5 Books Donated', threshold: 5 },
  { id: 'ten_books', name: '10 Books Donated', threshold: 10 },
  { id: 'twenty_five_books', name: '25 Books Donated', threshold: 25 },
  { id: 'legend', name: 'Kesh Squad Legend', threshold: 50 },
];

export function badgesFor(booksDonated: number): Badge[] {
  return BADGES.filter((b) => booksDonated >= b.threshold);
}

export function nextBadge(booksDonated: number): Badge | undefined {
  return BADGES.find((b) => booksDonated < b.threshold);
}

export const RESERVED_NAMES = ['admin', 'administrator', 'kesh', 'keshsquad', 'kesh_squad', 'moderator', 'support', 'official'];
