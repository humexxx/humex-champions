import { z } from 'zod';

export const AddAdminClaimInput = z.object({
  uid: z.string().min(1, 'User ID is required'),
});

export type AddAdminClaimInput = z.infer<typeof AddAdminClaimInput>;
