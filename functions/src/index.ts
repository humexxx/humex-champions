import './fixPaths';
import * as admin from 'firebase-admin';

admin.initializeApp();

export * from './adminFunctions';
export * from './userFunctions';

export * from './finances';
export * from './uplift';
