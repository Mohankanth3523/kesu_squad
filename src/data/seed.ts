import { seedAma, seedComments, seedPosts } from './community';
import {
  seedCompletions,
  seedConversations,
  seedDonationListings,
  seedDonationRequests,
  seedMessages,
  seedParticipants,
  seedSaleListings,
} from './marketplace';
import type { MockDatabase } from './schema';
import { seedUsers } from './users';
import { seedVideos } from './videos';

/** Bump when the shape of stored prototype data changes; old browser data is then discarded. */
export const MOCK_DB_VERSION = 2;

export function createSeedDatabase(): MockDatabase {
  return structuredClone({
    version: MOCK_DB_VERSION,
    users: seedUsers,
    videos: seedVideos,
    posts: seedPosts,
    comments: seedComments,
    votes: [],
    ama: seedAma,
    listings: [...seedSaleListings, ...seedDonationListings],
    conversations: seedConversations,
    participants: seedParticipants,
    messages: seedMessages,
    donationRequests: seedDonationRequests,
    completions: seedCompletions,
    reports: [],
  });
}
