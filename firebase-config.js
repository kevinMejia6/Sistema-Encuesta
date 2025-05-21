import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCXHzK22QMOBusCterW4VwPj1ItF_ME7g4",
  authDomain: "prueba-vupioh.firebaseapp.com",
  projectId: "prueba-vupioh",
  storageBucket: "prueba-vupioh.appspot.com",
  messagingSenderId: "1022149703484",
  appId: "1:1022149703484:web:c73ef30d04ae7afdb8d039",
  measurementId: "G-FMDC0D1S0H"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
