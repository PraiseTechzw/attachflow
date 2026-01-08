'use server';

export interface UserProfile {
  id: string;
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
  universityName?: string;
  department?: string;
  date: any; // Firestore Timestamp
  monthYear: string;
  weekNumber: number;
  activitiesRaw: string;
  activitiesProfessional?: string;
  skills?: string[];
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  feedback?: string; // Supervisor comments
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  content?: string; // for compatibility with cut log sheet
}


export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp

  // Chapter 1: Introduction
  introduction_background?: string;
  introduction_organogram?: string; // Base64 image
  introduction_vision?: string;
  introduction_mission?: string;
  introduction_problemDefinition?: string;
  introduction_aim?: string;
  introduction_smartObjectives?: string;
  introduction_constraints?: string;
  introduction_justification?: string;

  // Chapter 2: Planning
  planning_businessValue?: string;
  planning_feasibility_technical?: string;
  planning_feasibility_operational?: string;
  planning_feasibility_economic?: string;
  planning_riskAnalysis?: string;
  planning_projectSchedule?: string; // Base64 image (Gantt Chart)

  // Chapter 3: Analysis
  analysis_infoGathering?: string;
  analysis_currentSystem?: string;
  analysis_processData?: string;
  analysis_weaknesses?: string;
  analysis_functionalRequirements?: string;
  analysis_nonFunctionalRequirements?: string;

  // Chapter 4: Design
  design_system?: string;
  design_architectural?: string;
  design_physical?: string;
  design_databaseSchema?: string; // Base64 image (ERD)
  design_packageDiagram?: string;
  design_classDiagram?: string;
  design_sequenceDiagram?: string;
  design_interface_input?: string;
  design_interface_output?: string;
  design_interface_security?: string;

  // Chapter 5: Implementation
  implementation_coding?: string;
  implementation_testing_unit?: string;
  implementation_testing_modular?: string;
  implementation_testing_acceptance?: string;
  implementation_testing_validation?: string;
  implementation_testing_verification?: string;
  implementation_installation_hardware?: string;
  implementation_installation_software?: string;
  implementation_installation_db?: string;
  implementation_installation_training?: string;
  implementation_review?: string;
  implementation_backup?: string;
  
  // Appendices
  appendix_userManual?: string;
  appendix_sampleCode?: string;
  appendix_researchMethodologies?: string;

  // Legacy fields (optional, for backward compatibility if needed)
  introduction?: string;
  methodology?: string;
  analysis?: string;
  design?: string;
  implementation?: string;
  conclusion?: string;
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


export interface FinalReportAIStructure {
    introduction: string;
    mainBody: string;
    conclusionAndRecommendations: string;
    technologiesUsed: string[];
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
    status: 'Draft' | 'Finalized';
    lastUpdated: any; // Firestore Timestamp
    // AI Generated content
    introduction?: string;
    duties?: string;
    problems?: string;
    analysis?: string;
    conclusion?: string;
}

export interface PolishLogEntryOutput {
    polishedContent: string;
}
