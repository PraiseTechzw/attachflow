'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { app } from './config';
import { createUserProfile } from './firestore';

const auth = getAuth(app);

export const signInUser = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  // Create user profile in Firestore
  await createUserProfile(userCredential.user.uid, email, null);
  return userCredential;
};

export const signOutUser = async () => {
  return signOut(auth);
};
