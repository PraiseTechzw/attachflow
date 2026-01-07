
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'student' | 'supervisor' | 'admin';
  goals?: string;
  createdAt: Date;
}

export interface DailyLog {
  id: string;
  userId: string;
  date: any; // Firestore Timestamp
  content: string;
  attachments?: any[]; // Document references
  feedback?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  proposalDoc?: any | null; // Document reference
  finalReportDoc?: any | null; // Document reference
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  introduction?: string;
  methodology?: string;
  analysis?: string;
  design?: string;
  implementation?: string;
  conclusion?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface Document {
  id: string;
  userId: string;
  filename: string;
  url: string;
  storagePath: string;
  mimeType: string;
  size: number;
  createdAt: any; // Can be Date or Firestore Timestamp
}
