export const FIRESTORE_PATHS = {
  USERS: (uid: string) => `users/${uid}`,
  UPLIFT: {
    PLANNER: (uid: string) => `uplift/${uid}/planner`,
  },
};
