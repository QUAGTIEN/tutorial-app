import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function adminApp() {
  if (getApps().length) return getApps()[0]!;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured.');
  }

  let serviceAccount: { project_id?: string; client_email?: string; private_key?: string };
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON.');
  }
  if (
    serviceAccount.project_id !== 'tutorial-app-82767' ||
    !serviceAccount.client_email ||
    !serviceAccount.private_key
  ) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not for the configured Firebase project.');
  }

  return initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
    }),
  });
}

export function adminAuth() {
  return getAuth(adminApp());
}

export function adminDb() {
  return getFirestore(adminApp());
}
