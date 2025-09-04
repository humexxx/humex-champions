import { logger } from 'firebase-functions';

export function logWithCorrelation(
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>,
  correlationId?: string
): void {
  const enrichedData = {
    ...data,
    correlationId: correlationId || generateCorrelationId(),
    timestamp: new Date().toISOString(),
  };

  switch (level) {
    case 'info':
      logger.info(message, enrichedData);
      break;
    case 'warn':
      logger.warn(message, enrichedData);
      break;
    case 'error':
      logger.error(message, enrichedData);
      break;
  }
}

function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const log = {
  info: (
    message: string,
    data?: Record<string, unknown>,
    correlationId?: string
  ) => logWithCorrelation('info', message, data, correlationId),
  warn: (
    message: string,
    data?: Record<string, unknown>,
    correlationId?: string
  ) => logWithCorrelation('warn', message, data, correlationId),
  error: (
    message: string,
    data?: Record<string, unknown>,
    correlationId?: string
  ) => logWithCorrelation('error', message, data, correlationId),
};
