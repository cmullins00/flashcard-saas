import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
 apiKey: "AIzaSyBhBAU8XiBbH_FwDz4ZDT5hl5iLrGyg-ws",
 authDomain: "flashcardsaas-5dba2.firebaseapp.com",
 projectId: "flashcardsaas-5dba2",
 storageBucket: "flashcardsaas-5dba2.appspot.com",
 messagingSenderId: "776502390703",
 appId: "1:776502390703:web:4252563e136221ada9895a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export {db};