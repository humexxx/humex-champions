import { IFinancialPlan } from '@shared/models/finances';
import { MOCKED_FINANCIAL_PLANS } from 'src/mock/financeMockData';

let mockData = [...MOCKED_FINANCIAL_PLANS];

export const mockFinancialPlansService = {
  subscribe: (
    _userId: string,
    onSuccess: (plans: IFinancialPlan[]) => void,
    onError: (error: string) => void
  ) => {
    const timeoutId = setTimeout(() => {
      try {
        onSuccess([...mockData]);
      } catch (error) {
        onError('Mock error occurred');
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  },

  get: async (_userId: string, id: string): Promise<IFinancialPlan> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const plan = mockData.find((p) => p.id === id);
    if (!plan) {
      throw new Error('No data found');
    }
    return { ...plan };
  },

  getAll: async (_userId: string): Promise<IFinancialPlan[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));

    return [...mockData];
  },

  set: async (_userId: string, data: IFinancialPlan): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 250));

    if (!data.id) {
      const newPlan = {
        ...data,
        id: `mocked-${Date.now()}`,
      };
      mockData.push(newPlan);
    } else {
      const index = mockData.findIndex((p) => p.id === data.id);
      if (index === -1) {
        throw new Error('Plan not found for update');
      }
      mockData[index] = { ...data };
    }
  },
};
