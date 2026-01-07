import { z } from 'genkit';
import { GenerateLogFeedbackOutputSchema } from './generate-log-feedback-shared';

export const ImproveLogEntryInputSchema = z.object({
  logContent: z.string().describe('The original, raw text of the daily log entry.'),
  critique: GenerateLogFeedbackOutputSchema.describe('The structured feedback received from the AI Mentor/supervisor.'),
});
export type ImproveLogEntryInput = z.infer<typeof ImproveLogEntryInputSchema>;

export const ImproveLogEntryOutputSchema = z.object({
  improvedContent: z.string().describe('The rewritten, improved version of the log entry that addresses the critique.'),
});
export type ImproveLogEntryOutput = z.infer<typeof ImproveLogEntryOutputSchema>;
