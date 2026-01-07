'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type IdTokenResult,
} from 'firebase/auth';
import { app } from './config';
import { createUserProfile } from './firestore';
import { createSessionCookie, clearSessionCookie } from './server-auth';

const auth = getAuth(app);

export const signInUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();
  await createSessionCookie(idToken);
  return userCredential;
};

export const signUpUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  // Create user profile in Firestore
  await createUserProfile(userCredential.user.uid, email, null);
  const idToken = await userCredential.user.getIdToken();
  await createSessionCookie(idToken);
  return userCredential;
};

export const signOutUser = async () => {
  await clearSessionCookie();
  return signOut(auth);
};
