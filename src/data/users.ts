import type { DbUser } from './schema';
import { daysAgo } from './time';

/** Fictional members. All names are invented for the prototype. */
const member = (id: string, displayName: string, course: DbUser['course'], joinedDaysAgo: number): DbUser => ({
  id,
  displayName,
  course,
  role: 'member',
  isGuest: false,
  joinedAt: daysAgo(joinedDaysAgo),
  showOnHonourBoard: true,
});

export const DEMO_MEMBER_ID = 'u-demo';
export const DEMO_ADMIN_ID = 'u-admin';

export const seedUsers: DbUser[] = [
  member(DEMO_MEMBER_ID, 'demo_amigo', 'MBBS', 120),
  { ...member(DEMO_ADMIN_ID, 'kesh_admin', undefined, 400), role: 'admin' },
  member('u-nikhil', 'night_shift_nikhil', 'MBBS', 300),
  member('u-ria', 'ria_reads', 'MBBS', 380),
  member('u-dent', 'dentdiaries', 'BDS', 360),
  member('u-aftab', 'aftab.k', 'MBBS', 210),
  member('u-meera', 'meera_molar', 'BDS', 190),
  member('u-sahil', 'sahil_in_second_year', 'MBBS', 160),
  member('u-tanvi', 'tanvi.t', 'MBBS', 240),
  member('u-joel', 'joel_on_rounds', 'MBBS', 330),
  member('u-arjun', 'arjun.bds', 'BDS', 150),
  member('u-priya', 'priya.p', 'MBBS', 270),
  member('u-kabir', 'kabir_k', 'MBBS', 90),
  member('u-zoya', 'zoya_ortho', 'BDS', 200),
];
