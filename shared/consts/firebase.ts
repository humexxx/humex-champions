export const FIRESTORE_PATHS = {
  USERS: (uid: string) => `users/${uid}`,
  FINANCES: {
    FINANCIAL_PLANS: (uid: string) => `finances/${uid}/financialPlans`,
  },
  UPLIFT: {
    PLANNER: (uid: string) => `uplift/${uid}/planner`,
  },
};
