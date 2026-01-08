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

const ProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const DailyLogSchema = z.object({
  date: z.any(),
  content: z.string(),
});

export const FinalReportInputSchema = z.object({
  project: ProjectSchema.describe('The main project details.'),
  logs: z.array(DailyLogSchema).describe('An array of all daily logs for the attachment period.'),
  studentName: z.string().describe("The student's name."),
});
export type FinalReportInput = z.infer<typeof FinalReportInputSchema>;


export const FinalReportOutputSchema = z.object({
    introduction: z.string().describe("A comprehensive introduction including a brief company background, major duties, major challenges, and suggested solutions."),
    mainBody: z.string().describe("The main body of the report. This should be a detailed narrative of duties and activities, challenges encountered, procedures followed to solve problems, analysis of work, and skills gained. Use the daily logs as the primary source."),
    conclusionAndRecommendations: z.string().describe("A section for conclusions drawn from the attachment and recommendations for the company or future students."),
    technologiesUsed: z.array(z.string()).describe("A list of unique technologies, frameworks, and tools mentioned in the daily logs."),
});
export type FinalReportOutput = z.infer<typeof FinalReportOutputSchema>;


const generateFinalReportPrompt = ai.definePrompt({
  name: 'generateFinalReportPrompt',
  input: { schema: FinalReportInputSchema },
  output: { schema: FinalReportOutputSchema },
  prompt: `You are an AI assistant tasked with creating a structured, professional final industrial attachment report based on university guidelines.

Analyze the provided project details and the complete set of daily logs to generate the report sections.

**Instructions:**

1.  **Introduction (10 marks)**:
    - Write a comprehensive introduction.
    - Include a brief background of the company (based on project description).
    - Summarize the major duties/activities performed during the attachment.
    - List the major challenges/problems encountered.
    - Briefly mention suggested solutions or outcomes.

2.  **Main Body (60 marks)**:
    - Write a detailed narrative synthesizing all the daily logs.
    - Detail the duties and activities performed.
    - Describe the specific challenges and problems encountered.
    - Explain the procedures followed to solve these problems.
    - Analyze the work performed and its significance.
    - List the technical and soft skills gained throughout the process.

3.  **Conclusions and Recommendations (10 marks)**:
    - Write a conclusion summarizing the overall experience and achievements.
    - Provide recommendations for the company or for future students on attachment.
    
4.  **Technologies Used**: 
    - Scan all logs and extract a unique list of all programming languages, frameworks, libraries, and tools that were used.

5.  **Output**: Format your entire response according to the output schema.

**Project Details:**
- Title: {{{project.title}}}
- Description (contains company background): {{{project.description}}}

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
