
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
