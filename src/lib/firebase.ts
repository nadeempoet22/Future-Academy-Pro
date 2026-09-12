import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MCQ, Category, SiteSettings } from '../types';

// Operation types for Firestore error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: false,
      isAnonymous: true,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with designated databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Save a single MCQ to Cloud Firestore
 * This immediately pushes the question to all connected mobile phones and PCs.
 */
export async function saveMcqToCloud(mcq: MCQ): Promise<boolean> {
  const path = `mcqs/${mcq.id}`;
  try {
    const docRef = doc(db, 'mcqs', mcq.id);
    // Sanitize data for Firestore (no undefined values)
    const sanitized: Record<string, any> = { ...mcq };
    Object.keys(sanitized).forEach(k => {
      if (sanitized[k] === undefined) delete sanitized[k];
    });
    await setDoc(docRef, sanitized, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Bulk save MCQs to Cloud Firestore using batch writes
 */
export async function saveMultipleMcqsToCloud(mcqsList: MCQ[]): Promise<number> {
  if (!mcqsList || mcqsList.length === 0) return 0;
  let saved = 0;
  
  // Batch limit in Firestore is 500 operations
  const chunkSize = 400;
  for (let i = 0; i < mcqsList.length; i += chunkSize) {
    const chunk = mcqsList.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    for (const item of chunk) {
      const docRef = doc(db, 'mcqs', item.id);
      const sanitized: Record<string, any> = { ...item };
      Object.keys(sanitized).forEach(k => {
        if (sanitized[k] === undefined) delete sanitized[k];
      });
      batch.set(docRef, sanitized, { merge: true });
    }
    try {
      await batch.commit();
      saved += chunk.length;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'mcqs/batch');
    }
  }
  return saved;
}

/**
 * Delete an MCQ from Cloud Firestore
 */
export async function deleteMcqFromCloud(id: string): Promise<boolean> {
  const path = `mcqs/${id}`;
  try {
    await deleteDoc(doc(db, 'mcqs', id));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    return false;
  }
}

/**
 * Fetch all MCQs from Cloud Firestore once
 */
export async function fetchAllMcqsFromCloud(): Promise<MCQ[]> {
  const path = 'mcqs';
  try {
    const snap = await getDocs(collection(db, 'mcqs'));
    const items: MCQ[] = [];
    snap.forEach(docSnap => {
      items.push(docSnap.data() as MCQ);
    });
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}

/**
 * Real-time listener for MCQs:
 * Whenever ANY device (Admin PC or mobile) adds/edits a question,
 * this callback is invoked IMMEDIATELY on every connected phone and screen!
 */
export function subscribeToCloudMcqs(
  onUpdate: (mcqs: MCQ[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'mcqs';
  try {
    const unsubscribe = onSnapshot(
      collection(db, 'mcqs'),
      (snap) => {
        const list: MCQ[] = [];
        snap.forEach(d => {
          list.push(d.data() as MCQ);
        });
        onUpdate(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, path);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}

/**
 * Save Category to Cloud Firestore
 */
export async function saveCategoryToCloud(cat: Category): Promise<boolean> {
  const path = `categories/${cat.id}`;
  try {
    await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Bulk save categories to Cloud Firestore
 */
export async function saveCategoriesToCloud(cats: Category[]): Promise<void> {
  for (const c of cats) {
    await saveCategoryToCloud(c);
  }
}

/**
 * Real-time listener for Categories
 */
export function subscribeToCloudCategories(
  onUpdate: (categories: Category[]) => void
): () => void {
  const path = 'categories';
  try {
    const unsubscribe = onSnapshot(
      collection(db, 'categories'),
      (snap) => {
        const list: Category[] = [];
        snap.forEach(d => {
          list.push(d.data() as Category);
        });
        if (list.length > 0) {
          onUpdate(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}

/**
 * Save Site Settings to Cloud Firestore
 */
export async function saveSettingsToCloud(settings: SiteSettings): Promise<boolean> {
  const path = 'siteSettings/general';
  try {
    await setDoc(doc(db, 'siteSettings', 'general'), settings, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Real-time listener for Site Settings
 */
export function subscribeToCloudSettings(
  onUpdate: (settings: SiteSettings) => void
): () => void {
  const path = 'siteSettings/general';
  try {
    const unsubscribe = onSnapshot(
      doc(db, 'siteSettings', 'general'),
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as SiteSettings);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}
