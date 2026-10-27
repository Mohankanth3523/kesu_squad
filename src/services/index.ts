import { env } from '@/lib/env';
import type { Services } from './interfaces';
import { mockServices } from './mock';

/**
 * Picks the data implementation from VITE_DATA_SOURCE.
 * Milestone A: mock only. Milestone B adds `supabase`.
 */
function selectServices(): Services {
  switch (env.dataSource) {
    case 'mock':
      return mockServices;
  }
}

export const services: Services = selectServices();
export type { Services } from './interfaces';
