import type { DbVideo } from './schema';
import { daysAgo, hoursAgo } from './time';

/** Placeholder videos. Real links arrive once OQ-11 (how videos are added) is decided. */
export const seedVideos: DbVideo[] = [
  { id: 'v1', platform: 'youtube_video', title: 'First week of MBBS: what nobody tells you', description: 'Orientation, the white coat ceremony, and the first time you open Gray’s and close it again.', durationSeconds: 754, publishedAt: hoursAgo(20), hue: 42, discussionPostId: 'p2' },
  { id: 'v2', platform: 'youtube_video', title: 'How I actually studied for my first prof exam', description: 'The timetable that worked, the one that didn’t, and why I stopped making colourful notes.', durationSeconds: 1122, publishedAt: daysAgo(6), hue: 30 },
  { id: 'v3', platform: 'youtube_video', title: 'Hostel food tier list (brutally honest)', description: 'Rajma Wednesdays deserve respect.', durationSeconds: 619, publishedAt: daysAgo(12), hue: 18 },
  { id: 'v4', platform: 'youtube_video', title: 'Buying second-hand textbooks without getting scammed', description: 'Editions, missing pages, and the questions to ask before you pay anyone.', durationSeconds: 842, publishedAt: daysAgo(19), hue: 48 },
  { id: 'v5', platform: 'youtube_video', title: 'A day on BDS clinical postings', description: 'From the first patient at 9 a.m. to the last impression tray at 4.', durationSeconds: 965, publishedAt: daysAgo(27), hue: 24 },
  { id: 's1', platform: 'youtube_short', title: 'POV: viva starts in five minutes', durationSeconds: 38, publishedAt: daysAgo(1), hue: 48 },
  { id: 's2', platform: 'youtube_short', title: 'The one pen every BDS student owns', durationSeconds: 27, publishedAt: daysAgo(3), hue: 36 },
  { id: 's3', platform: 'youtube_short', title: 'Mnemonic that saved my anatomy viva', durationSeconds: 45, publishedAt: daysAgo(8), hue: 30 },
  { id: 'r1', platform: 'instagram_reel', title: 'Dissection hall, day one vs day ninety', durationSeconds: 44, publishedAt: daysAgo(2), hue: 24 },
  { id: 'r2', platform: 'instagram_reel', title: 'Packing for internship postings', durationSeconds: 52, publishedAt: daysAgo(5), hue: 54 },
  { id: 'r3', platform: 'instagram_reel', title: 'Library at 2 a.m. during exam season', durationSeconds: 31, publishedAt: daysAgo(9), hue: 40 },
];
