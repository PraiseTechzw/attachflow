
'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { initializeFirebase, updateDocumentNonBlocking } from '@/firebase';
import { createUserProfile } from './firestore';
import { createSessionCookie, clearSessionCookie } from './server-auth';
import { statsService } from './stats-service';
import { getFirestore, doc } from 'firebase/firestore';

const { auth } = initializeFirebase();

export const signInUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();
  await createSessionCookie(idToken);
  return userCredential;
};

export const signUpUser = async (userData) => {
  const { email, password, displayName, regNumber, companyName, universityName } = userData;
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  
  // Create user profile in Firestore
  await createUserProfile(userCredential.user.uid, {
    id: userCredential.user.uid,
    email: userCredential.user.email,
    displayName: displayName,
    regNumber: regNumber,
    companyName: companyName,
    universityName: universityName,
    role: 'student',
  });

  // IMPORTANT: Create the initial stats document at the same time.
  const db = getFirestore(auth.app);
  statsService.setFirestore(db);
  await statsService.createInitialStats(userCredential.user.uid);

  const idToken = await userCredential.user.getIdToken();
  await createSessionCookie(idToken);
  return userCredential;
};

export const signOutUser = async () => {
  await clearSessionCookie();
  return signOut(auth);
};
