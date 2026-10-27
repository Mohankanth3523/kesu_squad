/** Fixture timestamps are relative to "now" so the prototype always looks current. */
export function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60_000).toISOString();
}
export function hoursAgo(h: number): string {
  return minutesAgo(h * 60);
}
export function daysAgo(d: number): string {
  return hoursAgo(d * 24);
}
export const THIS_YEAR = new Date().getFullYear();
