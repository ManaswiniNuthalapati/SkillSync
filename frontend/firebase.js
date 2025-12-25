import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// (Only if you really need analytics — optional)
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBoY_xzdnq98eOcWVabxkuYK3YFnuBWOOs",
  authDomain: "skillsync-66652.firebaseapp.com",
  projectId: "skillsync-66652",
  storageBucket: "skillsync-66652.appspot.com",
  messagingSenderId: "590638803368",
  appId: "1:590638803368:web:bc9cb0232f3b0b52f8959d",
  measurementId: "G-VWEY25EVCN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// export const analytics = getAnalytics(app);  // Optional
