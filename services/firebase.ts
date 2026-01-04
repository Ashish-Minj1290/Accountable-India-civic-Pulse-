
/**
 * FIREBASE SETUP INSTRUCTIONS:
 * 1. Go to Firebase Console (console.firebase.google.com).
 * 2. Create a new project (e.g., "Accountable India").
 * 3. Enable Authentication:
 *    - Go to Authentication > Sign-in method.
 *    - Enable Email/Password.
 *    - Enable Google, Facebook, and Twitter (X).
 * 4. Create a Firestore Database:
 *    - Go to Firestore Database > Create database.
 *    - Start in Test Mode or update rules for production.
 * 5. Register a Web App and copy the config values to your environment.
 */

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  TwitterAuthProvider,
  GithubAuthProvider 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || process.env.API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const twitterProvider = new TwitterAuthProvider();
export const githubProvider = new GithubAuthProvider();
