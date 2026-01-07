'use client';
import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeFirebase } from '@/firebase';
import type { UserProfile, DailyLog, Project, Document } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const { firestore, storage } = initializeFirebase();

// User Profile Functions
export const createUserProfile = async (uid: string, data: Omit<UserProfile, 'uid' | 'createdAt' | 'role'> & { role?: 'student' | 'supervisor' | 'admin' }) => {
  const userProfileRef = doc(firestore, 'users', uid);
  const newUserProfile: UserProfile = {
    uid,
    email: data.email,
    displayName: data.displayName || 'New User',
    role: data.role || 'student', // Default role
    createdAt: new Date(), // Using client-side date for now
  };
  await setDoc(userProfileRef, newUserProfile);
  return newUserProfile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userProfileRef = doc(firestore, 'users', uid);
  const docSnap = await getDoc(userProfileRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Ensure Timestamps are converted to Dates
    return {
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    } as UserProfile;
  } else {
    return null;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(firestore, "users", uid);
    return await updateDoc(userRef, data);
};


// Daily Log Functions
export const createDailyLog = async (userId: string, data: Pick<DailyLog, 'content'>) => {
    const logCollection = collection(firestore, `users/${userId}/dailyLogs`);
    const newLog = {
        ...data,
        id: uuidv4(),
        userId,
        date: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        attachments: [],
    };
    return await addDoc(logCollection, newLog);
};

export const updateDailyLog = async (userId: string, logId: string, data: Partial<DailyLog>) => {
    const logRef = doc(firestore, `users/${userId}/dailyLogs`, logId);
    return await updateDoc(logRef, { ...data, updatedAt: serverTimestamp() });
};


// Project Functions
export const createProject = async (userId: string, data: Pick<Project, 'title' | 'description'>) => {
    const projectCollection = collection(firestore, `users/${userId}/projects`);
    const newProject: Omit<Project, 'id'> = {
        ...data,
        userId,
        status: 'Pending',
        proposalDoc: null,
        finalReportDoc: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const docRef = await addDoc(projectCollection, newProject);
    await updateDoc(docRef, { id: docRef.id }); // Add the id to the document
    return docRef;
};

// Document Functions
export const uploadDocument = async (userId: string, file: File) => {
    const storageRef = ref(storage, `users/${userId}/documents/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const docCollection = collection(firestore, `users/${userId}/documents`);
    const newDoc: Omit<Document, 'id'> = {
        userId,
        filename: file.name,
        storagePath: snapshot.ref.fullPath,
        mimeType: file.type,
        size: file.size,
        createdAt: new Date(),
        url: downloadURL,
    };
    
    const docRef = await addDoc(docCollection, newDoc);
    await updateDoc(docRef, { id: docRef.id });
    return { id: docRef.id, ...newDoc };
};

export const deleteDocument = async (userId: string, document: Document) => {
    // Delete file from storage
    const fileRef = ref(storage, document.storagePath);
    await deleteDoc(fileRef);
    
    // Delete firestore record
    const docRef = doc(firestore, `users/${userId}/documents`, document.id);
    return await deleteDoc(docRef);
};
