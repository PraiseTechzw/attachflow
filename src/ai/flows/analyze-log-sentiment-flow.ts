'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing the sentiment of a daily log entry.
 *
 * It exports:
 * - `analyzeLogSentiment`: An asynchronous function to analyze sentiment.
 * - `AnalyzeLogSentimentInput`: The TypeScript interface for the input.
 * - `AnalyzeLogSentimentOutput`: The TypeScript interface for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input schema for the flow
export const AnalyzeLogSentimentInputSchema = z.object({
  logContent: z.string().describe('The full text content of the daily log entry.'),
});
export type AnalyzeLogSentimentInput = z.infer<typeof AnalyzeLogSentimentInputSchema>;

// Define the output schema for the flow
export const AnalyzeLogSentimentOutputSchema = z.object({
  sentiment: z.enum(['Positive', 'Neutral', 'Negative']).describe('The overall emotional sentiment of the log entry.'),
});
export type AnalyzeLogSentimentOutput = z.infer<typeof AnalyzeLogSentimentOutputSchema>;

// Define the main function that calls the flow
export async function analyzeLogSentiment(input: AnalyzeLogSentimentInput): Promise<AnalyzeLogSentimentOutput> {
  return analyzeLogSentimentFlow(input);
}

const analyzeLogSentimentPrompt = ai.definePrompt({
  name: 'analyzeLogSentimentPrompt',
  input: { schema: AnalyzeLogSentimentInputSchema },
  output: { schema: AnalyzeLogSentimentOutputSchema },
  prompt: `You are an AI assistant that analyzes text for its emotional tone.
Based on the following daily log entry, classify the overall sentiment as "Positive", "Neutral", or "Negative".

- **Positive**: The user expresses excitement, accomplishment, satisfaction, or overcomes a challenge successfully.
- **Neutral**: The user states facts, describes a process without strong emotion, or is objective.
- **Negative**: The user expresses frustration, confusion, difficulty, or mentions unresolved problems or stress.

Log Content:
{{{logContent}}}
`,
});

// Define the flow
const analyzeLogSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeLogSentimentFlow',
    inputSchema: AnalyzeLogSentimentInputSchema,
    outputSchema: AnalyzeLogSentimentOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeLogSentimentPrompt(input);
    return output!;
  }
);
