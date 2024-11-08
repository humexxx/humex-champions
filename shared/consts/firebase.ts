export const FIRESTORE_PATHS = {
  USERS: (uid: string) => `users/${uid}`,
  FINANCES: {
    FINANCIAL_PLANS: (uid: string) => `finances/${uid}/financialPlans`,
  },
  UPLIFT: {
    INDEX: (uid: string) => `uplift/${uid}`,
    PLANNER: (uid: string) => `uplift/${uid}/planner`,
  },
};
