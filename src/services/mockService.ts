import { IFinancialPlan } from '@shared/models/finances';
import { User } from 'firebase/auth';

// User
export const MOCKED_USER: User = {
  uid: '123',
  email: 'mocked@mocked.com',
  providerData: [{ displayName: 'Mocked User' }],
} as User;

// Financial
export const MOCKED_FINANCIAL_PLAN: IFinancialPlan = {
  id: '123',
  name: 'Mocked Financial Plan',
  debts: [],
  fixedExpenses: [],
  incomes: [],
  financialSnapshots: [],
};
