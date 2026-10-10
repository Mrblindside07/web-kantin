// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue, update, remove, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA422KuGv-lJ86IJrjAxo67OeM8QOfpdZ4",
  authDomain: "imk-fando-aufa.firebaseapp.com",
  databaseURL: "https://imk-fando-aufa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "imk-fando-aufa",
  storageBucket: "imk-fando-aufa.firebasestorage.app",
  messagingSenderId: "142656276642",
  appId: "1:142656276642:web:bfa43814f9f5f2155beffb",
  measurementId: "G-9254JPQS09"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, push, onValue, update, remove, get, query, orderByChild, equalTo };
