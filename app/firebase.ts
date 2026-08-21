import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (typeof process !== "undefined" ? process.env?.FIREBASE_API_KEY : "") || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (typeof process !== "undefined" ? process.env?.FIREBASE_AUTH_DOMAIN : "") || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (typeof process !== "undefined" ? process.env?.FIREBASE_PROJECT_ID : "") || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (typeof process !== "undefined" ? process.env?.FIREBASE_STORAGE_BUCKET : "") || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (typeof process !== "undefined" ? process.env?.FIREBASE_MESSAGING_SENDER_ID : "") || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (typeof process !== "undefined" ? process.env?.FIREBASE_APP_ID : "") || ""
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };
