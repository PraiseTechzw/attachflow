'use server';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  role: 'student' | 'supervisor' | 'admin';
  goals?: string;
  createdAt: Date;
  regNumber?: string;
  companyName?: string;
  universityName?: string;
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


export interface ReportChapter {
    title: string;
    summary: string;
}

export interface FinalReportAIStructure {
    introduction: string;
    chapters: ReportChapter[];
    technologiesUsed: string[];
    conclusion: string;
}

export interface Skill {
  id: string;
  userId: string;
  name: string;
  frequency: number;
}

export interface MonthlyReport {
    id: string; // e.g., "2024-08"
    userId: string;
    month: string; // e.g., "August 2024"
    year: number;
    logCount: number;
    status: 'Draft' | 'Submitted' | 'Finalized';
    lastUpdated: any; // Firestore Timestamp
    // AI Generated content
    introduction?: string;
    duties?: string;
    problems?: string;
    analysis?: string;
    conclusion?: string;
}
