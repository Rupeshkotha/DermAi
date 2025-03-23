import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrVZRygLGZevCqgbQ1XrYq5sHefpCO2_U",
  authDomain: "skin-diseases-diagnosis-90434.firebaseapp.com",
  projectId: "skin-diseases-diagnosis-90434",
  storageBucket: "skin-diseases-diagnosis-90434.firebasestorage.app",
  messagingSenderId: "335027165157",
  appId: "1:335027165157:web:768ffba04fd514c780810c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 