import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, Firestore, initializeFirestore, CACHE_SIZE_UNLIMITED, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { query, collection, getDocs } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Debug: Log configuration (without sensitive values)
console.log('Firebase Config:', {
  ...firebaseConfig,
  apiKey: '***',
  messagingSenderId: '***',
  appId: '***'
});

// Initialize Firebase
let app: FirebaseApp;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Initialize Firestore with error handling
let db: Firestore;
let isFirestoreReady = false;

const initializeFirestoreInstance = async () => {
  try {
    // Initialize Firestore with custom settings
    db = initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true
    });
    
    // Enable persistence BEFORE any other operations
    try {
      await enableIndexedDbPersistence(db);
      console.log('Firestore persistence enabled successfully');
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support persistence.');
      } else {
        console.error('Error enabling persistence:', err);
      }
    }

    // Enable network connection
    await enableNetwork(db);
    console.log('Firestore network enabled');

    // Test the connection
    const testQuery = query(collection(db, 'test'));
    await getDocs(testQuery);
    console.log('Firestore connection verified');

    isFirestoreReady = true;
    console.log('Firestore initialized successfully');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    throw error;
  }
};

// Initialize Firestore
initializeFirestoreInstance().catch(error => {
  console.error('Failed to initialize Firestore:', error);
});

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

// Set up auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.uid);
  } else {
    console.log('User is signed out');
  }
});

export { app, db, auth, storage, isFirestoreReady };

export default app; 