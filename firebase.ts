import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD6mq3pcTkb4UZJwwme8NUhZbgN2VQCH8Q",
  authDomain: "bode-app-c1c08.firebaseapp.com",
  projectId: "bode-app-c1c08",
  storageBucket: "bode-app-c1c08.firebasestorage.app",
  messagingSenderId: "1048198673260",
  appId: "1:1048198673260:web:46e0ffd115505cbd00f949",
  measurementId: "G-3SXE5MFZQ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Firestore and export it
export const db = getFirestore(app);
