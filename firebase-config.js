
// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCrHG1k9Wa_S2JdlIcZowMWof-5ShxHvNY",
  authDomain: "encuentas-como.firebaseapp.com",
  projectId: "encuentas-como",
  storageBucket: "encuentas-como.firebasestorage.app",
  messagingSenderId: "1091819567760",
  appId: "1:1091819567760:web:8db7dfa15eb165ebd03615",
  measurementId: "G-6EPGF4GY1J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
export const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);

// Test Firestore connection
console.log('Firebase initialized successfully');
