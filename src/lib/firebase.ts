// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "virtupath-ai.firebaseapp.com",
  projectId: "virtupath-ai",
  storageBucket: "virtupath-ai.firebasestorage.app",
  messagingSenderId: "246481856423",
  appId: "1:246481856423:web:1114ad6ceaf692c088f882",
  measurementId: "G-N4HDERL070"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
