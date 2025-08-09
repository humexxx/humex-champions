import { IFinancialPlan } from '@shared/models/finances';
import { MOCKED_FINANCIAL_PLANS } from 'src/mock/financeMockData';

let mockData = [...MOCKED_FINANCIAL_PLANS];

// Sistema de subscriptores para simular Firebase onSnapshot
type SubscriberCallback = (plans: IFinancialPlan[]) => void;
const subscribers: Set<SubscriberCallback> = new Set();

// Función para notificar a todos los subscribers
const notifySubscribers = () => {
  subscribers.forEach((callback) => {
    try {
      callback([...mockData]);
    } catch (error) {
      console.error('Error notifying subscriber:', error);
    }
  });
};

export const mockFinancialPlansService = {
  subscribe: (
    _userId: string,
    onSuccess: (plans: IFinancialPlan[]) => void,
    onError: (error: string) => void
  ) => {
    // Agregar al conjunto de subscribers
    subscribers.add(onSuccess);

    // Enviar datos iniciales
    const timeoutId = setTimeout(() => {
      try {
        onSuccess([...mockData]);
      } catch (error) {
        onError('Mock error occurred');
      }
    }, 300);

    // Retornar función de cleanup
    return () => {
      clearTimeout(timeoutId);
      subscribers.delete(onSuccess);
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

    // Notificar a todos los subscribers después de la mutación
    setTimeout(() => {
      notifySubscribers();
    }, 100);
  },
};
