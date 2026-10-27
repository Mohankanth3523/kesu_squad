import type { Services } from '../interfaces';
import { mockAma } from './ama.mock';
import { mockAuth } from './auth.mock';
import { mockCommunity } from './community.mock';
import { mockContent } from './content.mock';
import { mockBooks, mockDonations } from './marketplace.mock';
import { mockMessaging } from './messaging.mock';
import { mockHonour } from './honour.mock';
import { mockReports, mockSearch } from './misc.mock';
import { mockDb } from './mockDb';

export const mockServices: Services = {
  auth: mockAuth,
  content: mockContent,
  community: mockCommunity,
  ama: mockAma,
  books: mockBooks,
  donations: mockDonations,
  messaging: mockMessaging,
  honour: mockHonour,
  search: mockSearch,
  reports: mockReports,
  prototype: { reset: () => mockDb.reset() },
  onDataChange: (listener) => mockDb.subscribe(listener),
};
