/** Join class names, skipping falsy values. Keep variant classes non-conflicting by design. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
