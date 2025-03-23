import { db, auth, isFirestoreReady } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, Timestamp, onSnapshot, enableNetwork, disableNetwork, Firestore, deleteDoc, enableIndexedDbPersistence, enableMultiTabIndexedDbPersistence, getFirestore, initializeFirestore, connectFirestoreEmulator, waitForPendingWrites } from 'firebase/firestore';
import { MonitoredCondition, ProgressEntry, AIInsights } from '../types';
import { onAuthStateChanged, User } from 'firebase/auth';
import StorageService from './storageService';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const checkAuth = async (): Promise<User> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        console.log('Authenticated user:', user.uid);
        resolve(user);
      } else {
        reject(new Error('User not authenticated'));
      }
    });
  });
};

const checkConnection = async () => {
  if (!isFirestoreReady) {
    throw new Error('Firestore is not ready yet');
  }
  
  try {
    // Test the connection with a simple query
    const testQuery = query(collection(db, 'test'));
    await getDocs(testQuery);
    console.log('Firestore connection verified');
    return true;
  } catch (error) {
    console.error('Firestore connection error:', error);
    return false;
  }
};

const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    // Check connection before attempting operation
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('No Firestore connection');
    }
    
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation... (${retries} attempts left)`);
      await delay(RETRY_DELAY);
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};

class MonitoringService {
  private static instance: MonitoringService;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private storageService: StorageService;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    this.storageService = StorageService.getInstance();
    this.initializationPromise = this.initialize();
  }

  private async initialize() {
    try {
      console.log('Initializing MonitoringService...');
      
      // Wait for Firestore to be ready
      if (!isFirestoreReady) {
        console.log('Waiting for Firestore to be ready...');
        await new Promise<void>((resolve) => {
          const checkReady = () => {
            if (isFirestoreReady) {
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });
      }
      
      console.log('Firestore is ready, proceeding with initialization');

      // Enable persistence
      try {
        await enableIndexedDbPersistence(db as Firestore);
        console.log('Firestore persistence enabled');
      } catch (err: any) {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser does not support persistence.');
        }
      }

      // Enable network
      await enableNetwork(db as Firestore);
      console.log('Firestore network enabled');

      // Verify connection with a simple query
      const testQuery = query(collection(db as Firestore, 'test'));
      await getDocs(testQuery);
      console.log('Firestore connection verified');

      this.isInitialized = true;
      console.log('MonitoringService initialized successfully');
    } catch (error) {
      console.error('Error initializing MonitoringService:', error);
      throw error;
    }
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private async ensureInitialized() {
    if (!this.isInitialized && this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = MAX_RETRIES
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.ensureInitialized();
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`Attempt ${attempt} failed:`, lastError);
        if (attempt < maxRetries) {
          await delay(RETRY_DELAY * attempt);
        }
      }
    }
    
    throw lastError || new Error('Operation failed after all retries');
  }

  async startMonitoring(
    userId: string,
    diseaseName: string,
    initialImage: string,
    initialConfidence: number,
    frequency: 'daily' | 'weekly' = 'daily'
  ): Promise<string> {
    try {
      console.log('Starting monitoring for user:', userId);
      
      await this.ensureInitialized();

      const currentUser = await checkAuth();
      console.log('Authenticated user:', currentUser.uid);

      if (userId !== currentUser.uid) {
        throw new Error('User ID mismatch');
      }

      // Create the monitored condition
      const monitoredCondition: Omit<MonitoredCondition, 'id'> = {
        userId,
        diseaseName,
        startDate: new Date(),
        status: 'active',
        initialImage,
        initialConfidence,
        checkInFrequency: frequency,
        nextCheckInDue: new Date(Date.now() + (frequency === 'daily' ? 24 : 7 * 24) * 60 * 60 * 1000),
        notes: ''
      };

      console.log('Creating monitored condition:', monitoredCondition);

      // Use retryOperation for the write operation
      const docRef = await this.retryOperation(async () => {
        const collectionRef = collection(db as Firestore, 'monitoredConditions');
        return await addDoc(collectionRef, {
          ...monitoredCondition,
          startDate: Timestamp.fromDate(monitoredCondition.startDate),
          nextCheckInDue: Timestamp.fromDate(monitoredCondition.nextCheckInDue)
        });
      });

      console.log('Created monitored condition with ID:', docRef.id);

      // Set up real-time monitoring
      this.setupRealTimeMonitoring(docRef.id, userId);

      return docRef.id;
    } catch (error) {
      console.error('Error in startMonitoring:', error);
      throw error;
    }
  }

  private setupRealTimeMonitoring(conditionId: string, userId: string) {
    try {
      const conditionRef = doc(db as Firestore, 'monitoredConditions', conditionId);
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(conditionRef, 
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            console.log('Condition updated:', data);
            // Handle updates here
          }
        },
        (error) => {
          console.error('Error in real-time monitoring:', error);
        }
      );

      // Store unsubscribe function for cleanup
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }
      
      this.monitoringInterval = setInterval(() => {
        // Check if condition still exists
        getDocs(query(collection(db as Firestore, 'monitoredConditions'), 
          where('id', '==', conditionId)))
          .then(snapshot => {
            if (snapshot.empty) {
              console.log('Condition no longer exists, cleaning up monitoring');
              if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
                this.monitoringInterval = null;
              }
              unsubscribe();
            }
          })
          .catch(error => {
            console.error('Error checking condition existence:', error);
          });
      }, 60000); // Check every minute
    } catch (error) {
      console.error('Error setting up real-time monitoring:', error);
    }
  }

  async addProgressEntry(
    userId: string,
    conditionId: string,
    imageUrl: string,
    confidence: number,
    notes: string,
    symptoms: string[],
    improvement: 'better' | 'same' | 'worse',
    ai_insights: AIInsights
  ): Promise<void> {
    try {
      const currentUser = await checkAuth();
      if (userId !== currentUser.uid) {
        throw new Error('User ID mismatch');
      }

      const progressEntry = {
        userId,
        conditionId,
        date: new Date(),
        imageUrl,
        confidence,
        notes,
        symptoms,
        improvement,
        ai_insights
      };

      await retryOperation(async () => {
        await addDoc(collection(db as Firestore, 'progressEntries'), {
          ...progressEntry,
          date: Timestamp.fromDate(progressEntry.date)
        });

        // Update the last check-in in the monitored condition
        const conditionRef = doc(db as Firestore, 'monitoredConditions', conditionId);
        await updateDoc(conditionRef, {
          lastCheckIn: {
            date: Timestamp.fromDate(progressEntry.date),
            improvement: progressEntry.improvement
          },
          nextCheckInDue: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)) // Set next check-in to 24 hours from now
        });
      });
    } catch (error) {
      console.error('Error adding progress entry:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to add progress entry: ${error.message}`);
      }
      throw new Error('Failed to add progress entry: Unknown error');
    }
  }

  async updateConditionImage(conditionId: string, newImageFile: File): Promise<void> {
    try {
      const currentUser = await checkAuth();
      const conditionRef = doc(db, 'monitoredConditions', conditionId);
      const conditionDoc = await getDoc(conditionRef);
      
      if (!conditionDoc.exists()) {
        throw new Error('Condition not found');
      }

      const conditionData = conditionDoc.data();
      const oldImageUrl = conditionData.initialImage;

      // Update the image in Firebase Storage
      const newImageUrl = await this.storageService.updateImage(oldImageUrl, newImageFile, currentUser.uid);

      // Update the condition document with the new image URL
      await updateDoc(conditionRef, {
        initialImage: newImageUrl,
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Error updating condition image:', error);
      throw error;
    }
  }

  async deleteCondition(conditionId: string): Promise<void> {
    try {
      const currentUser = await checkAuth();
      const conditionRef = doc(db, 'monitoredConditions', conditionId);
      const conditionDoc = await getDoc(conditionRef);
      
      if (!conditionDoc.exists()) {
        throw new Error('Condition not found');
      }

      const conditionData = conditionDoc.data();
      
      // Delete all associated images from Firebase Storage
      if (conditionData.initialImage) {
        await this.storageService.deleteImage(conditionData.initialImage);
      }
      
      if (conditionData.progressEntries) {
        for (const entry of conditionData.progressEntries) {
          if (entry.imageUrl) {
            await this.storageService.deleteImage(entry.imageUrl);
          }
        }
      }

      // Delete the condition document from Firestore
      await deleteDoc(conditionRef);
    } catch (error) {
      console.error('Error deleting condition:', error);
      throw error;
    }
  }

  async getConditionProgress(conditionId: string): Promise<ProgressEntry[]> {
    try {
      const currentUser = await checkAuth();
      
      const q = query(
        collection(db as Firestore, 'progressEntries'),
        where('conditionId', '==', conditionId),
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().date as Timestamp).toDate()
      })) as ProgressEntry[];
    } catch (error) {
      console.error('Error getting condition progress:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to get condition progress: ${error.message}`);
      }
      throw new Error('Failed to get condition progress: Unknown error');
    }
  }

  async getUserActiveConditions(userId: string): Promise<MonitoredCondition[]> {
    try {
      const currentUser = await checkAuth();
      if (userId !== currentUser.uid) {
        throw new Error('User ID mismatch');
      }

      const q = query(
        collection(db as Firestore, 'monitoredConditions'),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: (doc.data().startDate as Timestamp).toDate(),
        nextCheckInDue: (doc.data().nextCheckInDue as Timestamp).toDate(),
        lastCheckIn: doc.data().lastCheckIn ? {
          ...doc.data().lastCheckIn,
          date: (doc.data().lastCheckIn.date as Timestamp).toDate()
        } : undefined
      })) as MonitoredCondition[];
    } catch (error) {
      console.error('Error getting user conditions:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to get user conditions: ${error.message}`);
      }
      throw new Error('Failed to get user conditions: Unknown error');
    }
  }

  async updateConditionStatus(
    conditionId: string,
    status: 'active' | 'completed' | 'archived'
  ): Promise<void> {
    try {
      await updateDoc(doc(db as Firestore, 'monitoredConditions', conditionId), {
        status
      });
    } catch (error) {
      console.error('Error updating condition status:', error);
      throw error;
    }
  }
}

export default MonitoringService; 