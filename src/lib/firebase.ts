import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// Lazy Firebase initialization (only when needed)
let db: Firestore | null = null;
export function getDb(): Firestore {
  if (!db) {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: import.meta.env.FIREBASE_PROJECT_ID,
          clientEmail: import.meta.env.FIREBASE_CLIENT_EMAIL,
          privateKey: import.meta.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    db = getFirestore();
  }
  return db;
}

// Normalize an email for a deterministic doc id (subscribe + unsubscribe webhook must match)
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
