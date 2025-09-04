import { logger } from 'firebase-functions';
import { FunctionsErrorCode, HttpsError } from 'firebase-functions/v2/https';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function mapToHttpsError(error: unknown): HttpsError {
  logger.error('Function error:', error);

  if (error instanceof HttpsError) {
    return error;
  }

  if (error instanceof AppError) {
    const code = mapStatusCodeToHttpsErrorCode(error.statusCode);
    return new HttpsError(code, error.message, error.details);
  }

  if (error instanceof Error) {
    return new HttpsError('internal', error.message);
  }

  return new HttpsError('internal', 'An unexpected error occurred');
}

function mapStatusCodeToHttpsErrorCode(statusCode: number): FunctionsErrorCode {
  switch (statusCode) {
    case 400:
      return 'invalid-argument';
    case 401:
      return 'unauthenticated';
    case 403:
      return 'permission-denied';
    case 404:
      return 'not-found';
    case 409:
      return 'already-exists';
    case 429:
      return 'resource-exhausted';
    case 501:
      return 'unimplemented';
    case 503:
      return 'unavailable';
    default:
      return 'internal';
  }
}
