import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, setLogLevel } from "firebase/firestore";
import path from "path";

// Adjust path to point to root .env from ./api/dist/ or ./api/
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

export const GOOGLE_WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID || "";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Suppress known "Disconnecting idle stream" error logs from Client SDK usage on Backend
setLogLevel('silent');

const auth = getAuth(app);

export { app, auth, db };

