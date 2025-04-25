export const FIRESTORE_PATHS = {
  USERS: (uid: string) => `users/${uid}`,
  FINANCES: {
    FINANCIAL_PLANS: (uid: string) => `finances/${uid}/financial-plans`,
    PORTFOLIO: (uid: string) => `finances/${uid}/portfolio`,
  },
  UPLIFT: {
    INDEX: (uid: string) => `uplift/${uid}`,
    PLANNER: (uid: string) => `uplift/${uid}/planner`,
    CHECKLIST: (uid: string) => `uplift/${uid}/checklist`,
  },
};
