import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
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

export const MASTER_ADMIN_USERNAME = 'nadeemali1419';
export const MASTER_ADMIN_EMAIL = 'nadeem.poet22@gmail.com';
export const MASTER_ADMIN_PASSWORD = 'nadeemali001#';
export const MASTER_ADMIN_SESSION_RESET_VERSION = 'v7_forced_logout_nadeemali1419_nadeemali001_strictly_enforced';

export interface CloudAdminCredentials {
  username: string;
  email: string;
  password?: string;
  sessionVersion?: string;
  updatedAt: string;
}

/**
 * Get current Admin credentials directly from Cloud Firestore (useful for Vercel/client-side)
 */
export async function getAdminCredentialsFromCloud(): Promise<CloudAdminCredentials | null> {
  const path = 'adminAuth/master';
  try {
    const snap = await getDoc(doc(db, 'adminAuth', 'master'));
    if (snap.exists()) {
      return snap.data() as CloudAdminCredentials;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

/**
 * Save Admin credentials to Cloud Firestore for cross-device synchronization
 */
export async function saveAdminCredentialsToCloud(creds: {
  username: string;
  email: string;
  password?: string;
  sessionVersion?: string;
}): Promise<boolean> {
  const path = 'adminAuth/master';
  try {
    const payload: Record<string, any> = {
      username: creds.username.trim(),
      email: creds.email.trim(),
      updatedAt: new Date().toISOString()
    };
    if (creds.password && creds.password.trim()) {
      payload.password = creds.password.trim();
    }
    if (creds.sessionVersion) {
      payload.sessionVersion = creds.sessionVersion;
    }
    await setDoc(doc(db, 'adminAuth', 'master'), payload, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Force log out all devices across the world by bumping the cloud session version
 */
export async function forceLogoutAllDevicesInCloud(): Promise<string> {
  const newSessionVersion = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  await saveAdminCredentialsToCloud({
    username: MASTER_ADMIN_USERNAME,
    email: MASTER_ADMIN_EMAIL,
    password: MASTER_ADMIN_PASSWORD,
    sessionVersion: newSessionVersion
  });
  return newSessionVersion;
}

/**
 * Real-time listener for Admin Credentials across all devices
 */
export function subscribeToAdminCredentials(
  onUpdate: (creds: CloudAdminCredentials) => void
): () => void {
  const path = 'adminAuth/master';
  try {
    const unsubscribe = onSnapshot(
      doc(db, 'adminAuth', 'master'),
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as CloudAdminCredentials);
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

