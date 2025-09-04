import { HttpsError } from 'firebase-functions/v2/https';
import { ZodError, ZodType, z } from 'zod';

export const parseOrThrow = <T>(schema: ZodType<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = formatZodError(result.error);
    throw new HttpsError('invalid-argument', message);
  }
  return result.data;
};

function formatZodError(error: ZodError): string {
  const issues = error.issues.map((issue: z.core.$ZodIssue) => {
    const path = issue.path.length > 0 ? ` at ${issue.path.join('.')}` : '';
    return `${issue.message}${path}`;
  });
  return `Validation failed: ${issues.join(', ')}`;
}
