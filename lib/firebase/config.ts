// lib/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmcrsge5A-M_HzG8oYgy0jaE8oISwxnuU",
  authDomain: "orm-students.firebaseapp.com",
  projectId: "orm-students",
  storageBucket: "orm-students.firebasestorage.app",
  messagingSenderId: "291081092575",
  appId: "1:291081092575:web:d83b46d0d6f226e216986a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { auth, db };
