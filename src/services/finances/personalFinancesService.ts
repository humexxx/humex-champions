import { FIRESTORE_PATHS } from '@shared/consts';
import {
  IFinancialPlan,
  IDebt,
  IFixedExpense,
  IIncome,
} from '@shared/models/finances';
import { getError } from '@shared/utils';
import { PERIOD_TYPES } from '@shared/enums/finance';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';
import { firestore } from 'src/firebase';
import { normalizeObjectDates, toDayjs, toTimestamp } from 'src/utils';
import dayjs from 'dayjs';

// ============= MOCK DATA =============
const firstDayOfLastMonth = dayjs().subtract(1, 'month').startOf('month');
const firstDayOfMonth = dayjs().startOf('month');

const MOCKED_DEBTS: IDebt[] = [
  {
    annualInterest: 0.15,
    minimumPayment: 2000,
    name: 'Mocked Debt',
    pendingDebt: 40000,
    startDate: firstDayOfMonth,
  },
  {
    annualInterest: 0.7,
    minimumPayment: 2000,
    name: 'Mocked Debt 2',
    pendingDebt: 45000,
    startDate: firstDayOfMonth,
  },
];

const MOCKED_INCOMES: IIncome[] = [
  {
    amount: 8900,
    name: 'Mocked Income',
    period: PERIOD_TYPES.MONTHLY,
  },
  {
    amount: 5000,
    name: 'Mocked Income',
    period: PERIOD_TYPES.SINGLE,
    date: dayjs('07/01/2025'),
  },
];

const MOCKED_FIXED_EXPENSES: IFixedExpense[] = [
  {
    amount: 2500,
    expenseType: 'primary',
    name: 'Mocked Fixed Expense',
  },
  {
    amount: 2500,
    expenseType: 'primary',
    name: 'Mocked Secondary Fixed Expense',
  },
];

const MOCKED_FINANCIAL_PLAN: IFinancialPlan = {
  id: '123',
  name: 'Mocked Financial Plan',
  debts: MOCKED_DEBTS,
  fixedExpenses: MOCKED_FIXED_EXPENSES,
  incomes: MOCKED_INCOMES,
  financialSnapshots: [
    {
      date: firstDayOfLastMonth,
      debts: MOCKED_DEBTS,
      fixedExpenses: MOCKED_FIXED_EXPENSES,
      incomes: MOCKED_INCOMES,
      reviewed: true,
      expectedSurplus: 0,
      actualSurplus: 0,
    },
    {
      date: firstDayOfMonth,
      debts: MOCKED_DEBTS,
      fixedExpenses: MOCKED_FIXED_EXPENSES,
      incomes: MOCKED_INCOMES,
      reviewed: true,
      expectedSurplus: 0,
      actualSurplus: 0,
    },
  ],
};

const MOCKED_FINANCIAL_PLANS: IFinancialPlan[] = [MOCKED_FINANCIAL_PLAN];

// ============= FIREBASE SERVICE =============
export const financialPlansService = {
  getCollection: (userId: string) =>
    collection(firestore, FIRESTORE_PATHS.FINANCES.FINANCIAL_PLANS(userId)),

  subscribe: (
    userId: string,
    onSuccess: (plans: IFinancialPlan[]) => void,
    onError: (error: string) => void
  ) => {
    const collectionRef = financialPlansService.getCollection(userId);

    return onSnapshot(
      collectionRef,
      (snap) => {
        if (snap.empty) {
          onSuccess([]);
          return;
        }

        const data = snap.docs.map((doc) =>
          normalizeObjectDates<IFinancialPlan>(
            { id: doc.id, ...doc.data() },
            toDayjs
          )
        );

        onSuccess(data);
      },
      (error) => {
        onError(getError(error));
      }
    );
  },

  get: async (userId: string, id: string): Promise<IFinancialPlan> => {
    const collectionRef = financialPlansService.getCollection(userId);
    const docRef = doc(firestore, collectionRef.path, id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error('No data found');
    }

    return normalizeObjectDates<IFinancialPlan>(
      { id: snap.id, ...snap.data() },
      toDayjs
    );
  },

  getAll: async (userId: string): Promise<IFinancialPlan[]> => {
    const collectionRef = financialPlansService.getCollection(userId);
    const snap = await getDocs(collectionRef);

    if (snap.empty) {
      return [];
    }

    return snap.docs.map((doc) =>
      normalizeObjectDates<IFinancialPlan>(
        { id: doc.id, ...doc.data() },
        toDayjs
      )
    );
  },

  set: async (userId: string, data: IFinancialPlan): Promise<void> => {
    const collectionRef = financialPlansService.getCollection(userId);
    const docRef = data.id
      ? doc(firestore, collectionRef.path, data.id)
      : doc(collectionRef);

    const { id: _id, ..._data } = normalizeObjectDates<IFinancialPlan>(
      data,
      toTimestamp
    );

    return await setDoc(docRef, _data);
  },
};

// ============= MOCK SERVICE =============
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

// ============= FACTORY =============
export const createFinancialPlansService = (forceMock: boolean = false) => {
  return process.env.NODE_ENV === 'development' || forceMock
    ? mockFinancialPlansService
    : financialPlansService;
};
