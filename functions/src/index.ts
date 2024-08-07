import { createUserDocument } from './userFunctions';
import { addAdminClaim } from './adminFunctions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export { createUserDocument, addAdminClaim };
