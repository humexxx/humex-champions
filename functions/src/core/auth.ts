import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';

export function requireAuth(ctx: { auth?: { uid: string } }): string {
  const uid = ctx.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required');
  return uid;
}

export function requireAdmin(ctx: CallableRequest<unknown>): void {
  const token = ctx.auth?.token as { admin?: boolean };
  const isAdmin = token?.admin === true;
  if (!isAdmin)
    throw new HttpsError('permission-denied', 'Admin privileges required');
}

export function optionalAuth(ctx: { auth?: { uid: string } }): string | null {
  return ctx.auth?.uid ?? null;
}
