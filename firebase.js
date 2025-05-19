// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBe_0pC4wg2L7RDxzM-ncdTDQUEm9r28UY",
  authDomain: "stockmanagementapp-2d6e7.firebaseapp.com",
  projectId: "stockmanagementapp-2d6e7",
  storageBucket: "stockmanagementapp-2d6e7.appspot.com", // ✅ Fixed
  messagingSenderId: "411480450139",
  appId: "1:411480450139:web:7d34243e1eba5113c04b7e",
  measurementId: "G-LS4RF6YXVR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
