export type DataSource = 'mock';

/** Validated environment. Milestone A only allows the mock data source. */
function readDataSource(): DataSource {
  const raw = (import.meta.env.VITE_DATA_SOURCE as string | undefined) ?? 'mock';
  if (raw !== 'mock') {
    console.warn(`VITE_DATA_SOURCE="${raw}" is not available yet. Falling back to mock data.`);
  }
  return 'mock';
}

export const env = {
  dataSource: readDataSource(),
  isDev: import.meta.env.DEV,
} as const;
