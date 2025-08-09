import { User } from 'firebase/auth';

export const MOCKED_USER: User = {
  uid: '123',
  email: 'mocked@mocked.com',
  providerData: [{ displayName: 'Mocked User' }],
} as User;
