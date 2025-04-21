import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";

// Optionally import the services that you want to use
// import {...} from 'firebase/auth';
// import {...} from 'firebase/database';
// import {...} from 'firebase/firestore';
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyDswjP7NRkBnSux1Yy-nwnXOGs9r1zpQZI',
  authDomain: 'virtual-front-desk.firebaseapp.com',
  databaseURL: 'https://virtual-front-desk.firebaseio.com/',
  projectId: 'virtual-front-desk',
  storageBucket: 'virtual-front-desk.appspot.com',
  messagingSenderId: '406346985154',
  appId: '1:406346985154:web:bce8297fd9746784a3155b',
  measurementId: 'G-8QCKHSY263z',
};

export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase