import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCto_m02BSHcuk_bL5brVukcnLHHJYhJMs",
  authDomain: "nexo-digital-9e762.firebaseapp.com",
  projectId: "nexo-digital-9e762",
  messagingSenderId: "157196685085",
  appId: "1:157196685085:web:4bbdedf77eb6138c09dbf4"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account"
});
