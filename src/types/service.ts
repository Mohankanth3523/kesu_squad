export type ServiceErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'rate_limited'
  | 'conflict'
  | 'network'
  | 'unknown';

/** Normalised error so UI states look the same for mock and real services. */
export class ServiceError extends Error {
  readonly code: ServiceErrorCode;
  readonly fieldErrors?: Record<string, string>;

  constructor(code: ServiceErrorCode, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ServiceError) {
    switch (error.code) {
      case 'network':
        return 'You appear to be offline. Check your connection and try again.';
      case 'not_found':
        return 'This page doesn’t exist or is no longer available.';
      case 'unauthorized':
        return 'Log in to continue.';
      case 'forbidden':
        return 'You don’t have access to this.';
      case 'rate_limited':
        return 'You’re doing that too often. Wait a minute and try again.';
      default:
        return error.message;
    }
  }
  return 'Something went wrong while loading this. Try again.';
}
