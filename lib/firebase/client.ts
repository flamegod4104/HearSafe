import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyAYYzdT7CRiCBtLtjWLYR_-fM21lm_Fr0M",
  authDomain: "hearsafe-9a8e5.firebaseapp.com",
  projectId: "hearsafe-9a8e5",
  storageBucket: "hearsafe-9a8e5.firebasestorage.app",
  messagingSenderId: "514081411673",
  appId: "1:514081411673:web:46336dec1b4eb8f59e9748",
  measurementId: "G-6Q932JNJKB"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app