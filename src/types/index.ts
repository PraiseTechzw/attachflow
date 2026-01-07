import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'student' | 'supervisor' | 'admin';
  goals?: string;
  createdAt: Timestamp;
}

export interface DailyLog {
  id: string;
  userId: string;
  date: Timestamp;
  content: string;
  attachments: DocumentReference[];
  feedback?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  proposalDoc: DocumentReference | null;
  finalReportDoc: DocumentReference | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DocumentReference {
  id: string;
  userId: string;
  name: string;
  url: string;
  path: string;
  fileType: string;
  size: number;
  createdAt: Timestamp;
}
