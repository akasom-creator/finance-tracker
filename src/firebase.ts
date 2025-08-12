import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAD_IJ4q0ornVSs6SI_9vcdACY2cgd-rzY",
  authDomain: "financial-tracker-9fcac.firebaseapp.com",
  databaseURL: "https://financial-tracker-9fcac-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "financial-tracker-9fcac",
  storageBucket: "financial-tracker-9fcac.firebasestorage.app",
  messagingSenderId: "756419682546",
  appId: "1:756419682546:web:6ce4a163a2ff72c943706b",
  measurementId: "G-Y929ZWF82Z"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
export const db = getFirestore(app);

// Get a reference to the auth service
export const auth = getAuth(app);