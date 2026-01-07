'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a structured final report
 * from a user's project information and all their daily logs.
 *
 * It exports:
 * - `generateFinalReport`: An asynchronous function to generate the structured report content.
 * - `FinalReportInput`: The TypeScript interface for the input.
 * - `FinalReportOutput`: The TypeScript interface for the structured output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the complex input object schemas
const ProjectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.string(),
  createdAt: z.any(),
  updatedAt: z.any(),
  // Chapter 1
  introduction_background: z.string().optional(),
  introduction_organogram: z.string().optional(),
  introduction_vision: z.string().optional(),
  introduction_mission: z.string().optional(),
  introduction_problemDefinition: z.string().optional(),
  introduction_aim: z.string().optional(),
  introduction_smartObjectives: z.string().optional(),
  introduction_constraints: z.string().optional(),
  introduction_justification: z.string().optional(),
  // Chapter 2
  planning_businessValue: z.string().optional(),
  planning_feasibility_technical: z.string().optional(),
  planning_feasibility_operational: z.string().optional(),
  planning_feasibility_economic: z.string().optional(),
  planning_riskAnalysis: z.string().optional(),
  planning_projectSchedule: z.string().optional(),
  // Chapter 3
  analysis_infoGathering: z.string().optional(),
  analysis_currentSystem: z.string().optional(),
  analysis_processData: z.string().optional(),
  analysis_weaknesses: z.string().optional(),
  analysis_functionalRequirements: z.string().optional(),
  analysis_nonFunctionalRequirements: z.string().optional(),
  // Chapter 4
  design_system: z.string().optional(),
  design_architectural: z.string().optional(),
  design_physical: z.string().optional(),
  design_databaseSchema: z.string().optional(),
  design_packageDiagram: z.string().optional(),
  design_classDiagram: z.string().optional(),
  design_sequenceDiagram: z.string().optional(),
  design_interface_input: z.string().optional(),
  design_interface_output: z.string().optional(),
  design_interface_security: z.string().optional(),
  // Chapter 5
  implementation_coding: z.string().optional(),
  implementation_testing_unit: z.string().optional(),
  implementation_testing_modular: z.string().optional(),
  implementation_testing_acceptance: z.string().optional(),
  implementation_testing_validation: z.string().optional(),
  implementation_testing_verification: z.string().optional(),
  implementation_installation_hardware: z.string().optional(),
  implementation_installation_software: z.string().optional(),
  implementation_installation_db: z.string().optional(),
  implementation_installation_training: z.string().optional(),
  implementation_review: z.string().optional(),
  implementation_backup: z.string().optional(),
  // Appendices
  appendix_userManual: z.string().optional(),
  appendix_sampleCode: z.string().optional(),
  appendix_researchMethodologies: z.string().optional(),
  // Legacy
  introduction: z.string().optional(),
  conclusion: z.string().optional(),
});


const DailyLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.any(), // Firestore Timestamp
  content: z.string(),
  feedback: z.string().optional(),
  createdAt: z.any(),
  updatedAt: z.any(),
});

// Define the input schema for the flow
export const FinalReportInputSchema = z.object({
  project: ProjectSchema.describe('The main project details.'),
  logs: z.array(DailyLogSchema).describe('An array of all daily logs for the attachment period.'),
  studentName: z.string().describe("The student's name."),
});
export type FinalReportInput = z.infer<typeof FinalReportInputSchema>;

// Define the output schema for the flow
const ReportChapterSchema = z.object({
    title: z.string().describe("A concise, descriptive title for this chapter or theme (e.g., 'Week 1-2: System Design & Setup')."),
    summary: z.string().describe("A detailed paragraph summarizing the key activities, challenges, and accomplishments covered in this chapter, based on the provided logs.")
});

export const FinalReportOutputSchema = z.object({
    introduction: z.string().describe("A professionally written introduction for the final report, using the project's problem statement and justification."),
    chapters: z.array(ReportChapterSchema).describe("An array of logical chapters, where each chapter represents a phase or theme of the work performed, derived from semantically clustering the daily logs."),
    technologiesUsed: z.array(z.string()).describe("A list of unique technologies, frameworks, and tools mentioned in the daily logs."),
    conclusion: z.string().describe("A professionally written conclusion for the final report, summarizing the project's achievements and outcomes."),
});
export type FinalReportOutput = z.infer<typeof FinalReportOutputSchema>;


const generateFinalReportPrompt = ai.definePrompt({
  name: 'generateFinalReportPrompt',
  input: { schema: FinalReportInputSchema },
  output: { schema: FinalReportOutputSchema },
  prompt: `You are an AI assistant tasked with creating a structured, professional final attachment report.

Analyze the provided project details and the complete set of daily logs. Your goal is to organize the raw logs into a coherent narrative.

**Instructions:**

1.  **Introduction & Conclusion**: Write a professional introduction based on the project's problem definition and justification. Write a strong conclusion that summarizes the project's outcomes.
2.  **Semantic Clustering**: Read all the daily logs and group them into logical, thematic chapters. A chapter could represent a time period (e.g., "Weeks 1-3"), a project phase (e.g., "Backend API Development"), or a key skill area (e.g., "User Interface Implementation"). Create 3-5 chapters.
3.  **Chapter Summaries**: For each chapter, write a detailed summary paragraph. This summary should synthesize the key activities, achievements, and challenges from the logs that fall into that chapter's theme.
4.  **Technologies Used**: Scan all logs and extract a unique list of all programming languages, frameworks, libraries, and tools that were used.
5.  **Output**: Format your entire response according to the output schema.

**Project Details:**
- Title: {{{project.title}}}
- Problem Definition: {{{project.introduction_problemDefinition}}}
- Justification: {{{project.introduction_justification}}}


**Daily Logs:**
{{#each logs}}
- {{date}}: {{{content}}}
{{/each}}
`,
});


// Define the flow
const generateFinalReportFlow = ai.defineFlow(
  {
    name: 'generateFinalReportFlow',
    inputSchema: FinalReportInputSchema,
    outputSchema: FinalReportOutputSchema,
  },
  async (input) => {
    const { output } = await generateFinalReportPrompt(input);
    return output!;
  }
);

// Define the main function that calls the flow
export async function generateFinalReport(input: FinalReportInput): Promise<FinalReportOutput> {
    return generateFinalReportFlow(input);
}
