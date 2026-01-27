import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBAfx_ApQHz1baf5azr_DlaOYZNK3qbrAY",
  authDomain: "serviceconnect-dfa05.firebaseapp.com",
  projectId: "serviceconnect-dfa05",
  storageBucket: "serviceconnect-dfa05.firebasestorage.app",
  messagingSenderId: "418989471090",
  appId: "1:418989471090:web:7b2a0c752542e9509f99eb"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
