
import { z } from 'genkit';

export const GenerateLogFeedbackInputSchema = z.object({
  logText: z.string().describe('The text content of the daily log.'),
  studentGoals: z.string().describe('The student attachment goals.'),
});
export type GenerateLogFeedbackInput = z.infer<typeof GenerateLogFeedbackInputSchema>;

export const ScorecardItemSchema = z.object({
  score: z.number().min(1).max(10).describe("The score from 1-10 for this criterion."),
  feedback: z.string().describe("Specific, constructive feedback for this criterion.")
});

export const GenerateLogFeedbackOutputSchema = z.object({
  supervisorComment: z.string().describe("A concise, overall comment (2-3 sentences) from a supervisor's perspective, summarizing the feedback."),
  technicalDepth: ScorecardItemSchema.describe("Evaluation of the log's technical detail and substance."),
  professionalTone: ScorecardItemSchema.describe("Evaluation of the log's tone, language, and professionalism."),
  problemSolvingClarity: ScorecardItemSchema.describe("Evaluation of how clearly the log describes problems and the steps taken to solve them."),
});
export type GenerateLogFeedbackOutput = z.infer<typeof GenerateLogFeedbackOutputSchema>;
