'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a structured final report
 * from a user's project information and all their daily logs.
 *
 * It exports:
 * - `generateFinalReportFlow`: An asynchronous function to generate the structured report content.
 * - `FinalReportInput`: The TypeScript interface for the input.
 * - `FinalReportOutput`: The TypeScript interface for the structured output.
 */

import { ai } from '@/ai/genkit';
import { DailyLog, Project } from '@/types';
import { z } from 'genkit';

// Define the complex input object schemas
const ProjectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.string(),
  introduction: z.string().optional(),
  methodology: z.string().optional(),
  analysis: z.string().optional(),
  design: z.string().optional(),
  implementation: z.string().optional(),
  conclusion: z.string().optional(),
  // Timestamps can be complex, stringify for simplicity or use z.date() if needed
  createdAt: z.any(),
  updatedAt: z.any(),
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
    introduction: z.string().describe("A professionally written introduction for the final report, based on the project details."),
    chapters: z.array(ReportChapterSchema).describe("An array of logical chapters, where each chapter represents a phase or theme of the work performed, derived from semantically clustering the daily logs."),
    technologiesUsed: z.array(z.string()).describe("A list of unique technologies, frameworks, and tools mentioned in the daily logs."),
    conclusion: z.string().describe("A professionally written conclusion for the final report, based on the project details."),
});
export type FinalReportOutput = z.infer<typeof FinalReportOutputSchema>;


const generateFinalReportPrompt = ai.definePrompt({
  name: 'generateFinalReportPrompt',
  input: { schema: FinalReportInputSchema },
  output: { schema: FinalReportOutputSchema },
  prompt: `You are an AI assistant tasked with creating a structured, professional final attachment report.

Analyze the provided project details and the complete set of daily logs. Your goal is to organize the raw logs into a coherent narrative.

**Instructions:**

1.  **Introduction & Conclusion**: Rewrite the provided project introduction and conclusion to be more professional and suitable for a final report.
2.  **Semantic Clustering**: Read all the daily logs and group them into logical, thematic chapters. A chapter could represent a time period (e.g., "Weeks 1-3"), a project phase (e.g., "Backend API Development"), or a key skill area (e.g., "User Interface Implementation"). Create 3-5 chapters.
3.  **Chapter Summaries**: For each chapter, write a detailed summary paragraph. This summary should synthesize the key activities, achievements, and challenges from the logs that fall into that chapter's theme.
4.  **Technologies Used**: Scan all logs and extract a unique list of all programming languages, frameworks, libraries, and tools that were used.
5.  **Output**: Format your entire response according to the output schema.

**Project Details:**
- Title: {{{project.title}}}
- Description: {{{project.description}}}
- Student's Intro Draft: {{{project.introduction}}}
- Student's Conclusion Draft: {{{project.conclusion}}}

**Daily Logs:**
{{#each logs}}
- {{date}}: {{{content}}}
{{/each}}
`,
});


// Define the main function that calls the flow
export const generateFinalReport = ai.defineFlow(
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
