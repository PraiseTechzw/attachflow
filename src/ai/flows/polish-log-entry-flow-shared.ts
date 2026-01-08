
import { z } from 'genkit';

export const PolishLogEntryInputSchema = z.object({
  logContent: z.string().describe('The raw, unedited text of the daily log entry.'),
});
export type PolishLogEntryInput = z.infer<typeof PolishLogEntryInputSchema>;

export const PolishLogEntryOutputSchema = z.object({
  polishedContent: z.string().describe('The polished, professional version of the log entry. It should be well-structured, clear, and use professional language.'),
});
export type PolishLogEntryOutput = z.infer<typeof PolishLogEntryOutputSchema>;
