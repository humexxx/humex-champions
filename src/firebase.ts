// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAQB6UEYwnPtRlMNtcCCDV9rzyGH-mCGNw',
  authDomain: 'humex-champions.firebaseapp.com',
  projectId: 'humex-champions',
  storageBucket: 'humex-champions.appspot.com',
  messagingSenderId: '412486963304',
  appId: '1:412486963304:web:907bb9f5f8764b58f76bdd',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
