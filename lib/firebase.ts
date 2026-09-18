import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase's web-app configuration is public. Only the service-account JSON
// used by the grading API must be kept in a Vercel Secret.
const firebaseConfig = {
  apiKey: 'AIzaSyDRnqijwEd5BJTtuguZfch7pkOehmDGf1I',
  authDomain: 'tutorial-app-82767.firebaseapp.com',
  projectId: 'tutorial-app-82767',
  storageBucket: 'tutorial-app-82767.firebasestorage.app',
  messagingSenderId: '323503116913',
  appId: '1:323503116913:web:9c0910e6b23b33505041d0',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
export const teacherUid = 'Dbn4Y2L4HTMv1yUGOmBdBZVMc0F2';

export function isTeacher(uid?: string | null) {
  return Boolean(uid) && uid === teacherUid;
}
