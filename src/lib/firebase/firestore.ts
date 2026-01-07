import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import type { UserProfile } from '@/types';

export const createUserProfile = async (
  uid: string,
  email: string,
  displayName: string | null
) => {
  const userProfileRef = doc(db, 'users', uid);
  const newUserProfile: UserProfile = {
    uid,
    email,
    displayName,
    role: 'student', // Default role
    createdAt: serverTimestamp() as any, // Let Firestore handle the timestamp
  };
  await setDoc(userProfileRef, newUserProfile);
  return newUserProfile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userProfileRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userProfileRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    return null;
  }
};
