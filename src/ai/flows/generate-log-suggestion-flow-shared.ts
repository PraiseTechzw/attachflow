
import { z } from 'genkit';

export const GenerateLogSuggestionInputSchema = z.object({
  previousLogContent: z.string().describe('The full text content of the previous daily log entry.'),
});
export type GenerateLogSuggestionInput = z.infer<typeof GenerateLogSuggestionInputSchema>;

export const GenerateLogSuggestionOutputSchema = z.object({
  suggestion: z.string().describe('A short, actionable suggestion for the next log entry. It should be written as if the user is continuing their work.'),
});
export type GenerateLogSuggestionOutput = z.infer<typeof GenerateLogSuggestionOutputSchema>;
