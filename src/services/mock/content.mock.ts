import type { ContentService } from '../interfaces';
import { mockDb } from './mockDb';
import { notFound, query } from './mockUtils';

export const mockContent: ContentService = {
  listVideos: ({ platform, limit } = {}) =>
    query(
      'content.listVideos',
      () =>
        mockDb
          .read()
          .videos.filter((v) => !platform || (platform === 'vertical' ? v.platform !== 'youtube_video' : v.platform === platform))
          .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
          .slice(0, limit),
      [],
    ),
  getVideo: (id) => query('content.getVideo', () => mockDb.read().videos.find((v) => v.id === id) ?? notFound('This video')),
};
