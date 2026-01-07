import { z } from 'genkit';

export const AnalyzeLogSentimentInputSchema = z.object({
  logContent: z.string().describe('The full text content of the daily log entry.'),
});
export type AnalyzeLogSentimentInput = z.infer<typeof AnalyzeLogSentimentInputSchema>;

export const AnalyzeLogSentimentOutputSchema = z.object({
  sentiment: z.enum(['Positive', 'Neutral', 'Negative']).describe('The overall emotional sentiment of the log entry.'),
});
export type AnalyzeLogSentimentOutput = z.infer<typeof AnalyzeLogSentimentOutputSchema>;
