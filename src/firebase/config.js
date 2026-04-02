// Firebase Configuration
// ⚠️ Replace these placeholder values with your actual Firebase project config
// Go to: Firebase Console → Project Settings → Your Apps → Web App → Config

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCWcuwpAR_aWGe9w3_n7PAgLy8DVPdfM_g",
  authDomain: "house-3035d.firebaseapp.com",
  projectId: "house-3035d",
  storageBucket: "house-3035d.firebasestorage.app",
  messagingSenderId: "944056320567",
  appId: "1:944056320567:web:60c0f06f74cc5c9d6c35b2",
  measurementId: "G-ZN0BLM0MY6"
};

// Initialize Firebase (safely for hot reloads)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Prevent Firebase Storage from hanging indefinitely on CORS or Auth errors
storage.maxOperationRetryTime = 10000; 
storage.maxUploadRetryTime = 10000;

export default app;
