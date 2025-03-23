import { collection, query, limit, getDocs, Firestore } from 'firebase/firestore';
import { db } from '../config/firebase';

export const checkConnection = async (): Promise<boolean> => {
  try {
    // Test the connection
    const testCollection = collection(db as Firestore, 'test');
    const q = query(testCollection, limit(1));
    await getDocs(q);
    return true;
  } catch (error) {
    console.error('Firestore connection error:', error);
    return false;
  }
};

export const getFirestoreInstance = () => {
  return db;
}; 