'use client';
import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject as deleteFile } from "firebase/storage";
import { initializeFirebase } from '@/firebase';
import type { UserProfile, DailyLog, Project, Document } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { format, getWeek } from 'date-fns';

const { firestore } = initializeFirebase();
const { storage } = initializeFirebase();

// User Profile Functions
export const createUserProfile = async (uid: string, data: Partial<Omit<UserProfile, 'createdAt'>>) => {
  const userProfileRef = doc(firestore, 'users', uid);
  const newUserProfile: UserProfile = {
    id: uid,
    email: data.email || null,
    displayName: data.displayName || 'New User',
    role: data.role || 'student', // Default role
    createdAt: new Date(),
  };
  await setDoc(userProfileRef, newUserProfile);
  return newUserProfile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userProfileRef = doc(firestore, 'users', uid);
  const docSnap = await getDoc(userProfileRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    } as UserProfile;
  } else {
    return null;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(firestore, "users", uid);
    return await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
};

// Daily Log Functions
export const createDailyLog = async (userId: string, data: Pick<DailyLog, 'content' | 'activitiesRaw'>) => {
    const logCollection = collection(firestore, `users/${userId}/dailyLogs`);
    const logId = uuidv4();
    const currentDate = new Date();
    const newLog: DailyLog = {
        ...data,
        id: logId,
        userId,
        date: serverTimestamp(),
        monthYear: format(currentDate, 'MMMM yyyy'),
        weekNumber: getWeek(currentDate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    await setDoc(doc(logCollection, logId), newLog);
    return newLog;
};

export const updateDailyLog = async (userId: string, logId: string, data: Partial<DailyLog>) => {
    const logRef = doc(firestore, `users/${userId}/dailyLogs`, logId);
    return await updateDoc(logRef, { ...data, updatedAt: serverTimestamp() });
};


// Project Functions
export const createProject = async (userId: string, data: Pick<Project, 'title' | 'description'>) => {
    const projectCollection = collection(firestore, `users/${userId}/projects`);
    const projectId = uuidv4();
    const newProject: Project = {
        ...data,
        id: projectId,
        userId,
        status: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    await setDoc(doc(projectCollection, projectId), newProject);
    return newProject;
};

// Document Functions
export const uploadDocument = async (userId: string, file: File): Promise<Document> => {
    const documentId = uuidv4();
    const storageRef = ref(storage, `users/${userId}/documents/${documentId}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const docCollection = collection(firestore, `users/${userId}/documents`);
    const newDoc: Document = {
        id: documentId,
        userId,
        filename: file.name,
        url: downloadURL,
        storagePath: snapshot.ref.fullPath,
        mimeType: file.type,
        size: file.size,
        createdAt: new Date(),
    };
    
    await setDoc(doc(docCollection, documentId), newDoc);
    return newDoc;
};

export const deleteDocument = async (userId: string, document: Document) => {
    // Delete file from storage
    const fileRef = ref(storage, document.storagePath);
    await deleteFile(fileRef);
    
    // Delete firestore record
    const docRef = doc(firestore, `users/${userId}/documents`, document.id);
    return await deleteDoc(docRef);
};