import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyATHp6Ifb2B3BFT59UCAgUWa9B8-tL5910",
    authDomain: "clipboard-72189.firebaseapp.com",
    projectId: "clipboard-72189",
    storageBucket: "clipboard-72189.firebasestorage.app",
    messagingSenderId: "1062727101489",
    appId: "1:1062727101489:web:ea214e68a8208f074d7910"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);