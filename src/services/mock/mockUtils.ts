import { ServiceError } from '@/types/service';

/**
 * Simulated network behaviour for the prototype.
 * Add `?mockError=<key>` to the URL to force an error, e.g. `?mockError=books.search`
 * or `?mockError=all`. Add `?mockEmpty=<key>` to force an empty list.
 * Set `?mockLatency=0` for instant responses (used by automated tests).
 */
function flag(param: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(param);
}

function flagMatches(param: string, key: string): boolean {
  const value = flag(param);
  if (!value) return false;
  return value === 'all' || value.split(',').some((k) => k === key || (k.endsWith('.*') && key.startsWith(k.slice(0, -1))));
}

async function delay() {
  const forced = flag('mockLatency');
  const ms = forced !== null ? Number(forced) : 200 + Math.round(Math.random() * 350);
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
}

/** Read operation: latency, optional forced error or empty result, deep copy of the result. */
export async function query<T>(key: string, produce: () => T, empty?: T): Promise<T> {
  await delay();
  if (flagMatches('mockError', key)) {
    throw new ServiceError('unknown', 'The prototype simulated a failure here so you can see the error state.');
  }
  if (empty !== undefined && flagMatches('mockEmpty', key)) return empty;
  return structuredClone(produce());
}

/** Write operation: latency, optional forced error, runs the mutation. */
export async function command<T>(key: string, run: () => T): Promise<T> {
  await delay();
  if (flagMatches('mockError', key)) {
    throw new ServiceError('unknown', 'The prototype simulated a failure here so you can see how errors are handled.');
  }
  return structuredClone(run());
}

export function notFound(what = 'This item'): never {
  throw new ServiceError('not_found', `${what} doesn’t exist or is no longer available.`);
}

export function forbidden(message = 'You don’t have access to this.'): never {
  throw new ServiceError('forbidden', message);
}

export function unauthorized(message = 'Log in to continue.'): never {
  throw new ServiceError('unauthorized', message);
}

export function invalid(message: string, fieldErrors?: Record<string, string | undefined>): never {
  const clean = fieldErrors
    ? Object.fromEntries(Object.entries(fieldErrors).filter((e): e is [string, string] => Boolean(e[1])))
    : undefined;
  throw new ServiceError('validation', message, clean);
}
