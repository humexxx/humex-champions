export type ICallableResponse<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string };

export type ICallableRequest<T = void> = T extends void
  ? { impersonatedUid?: string }
  : { impersonatedUid?: string; data: T };
