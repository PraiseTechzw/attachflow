'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a smart suggestion
 * for a new daily log based on the content of the previous day's log.
 *
 * It exports:
 * - `generateLogSuggestion`: An asynchronous function to generate the suggestion.
 * - `GenerateLogSuggestionInput`: The TypeScript interface for the input.
 * - `GenerateLogSuggestionOutput`: The TypeScript interface for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input schema for the flow
export const GenerateLogSuggestionInputSchema = z.object({
  previousLogContent: z.string().describe('The full text content of the previous daily log entry.'),
});
export type GenerateLogSuggestionInput = z.infer<typeof GenerateLogSuggestionInputSchema>;

// Define the output schema for the flow
export const GenerateLogSuggestionOutputSchema = z.object({
  suggestion: z.string().describe('A short, actionable suggestion for the next log entry. It should be written as if the user is continuing their work.'),
});
export type GenerateLogSuggestionOutput = z.infer<typeof GenerateLogSuggestionOutputSchema>;


const generateLogSuggestionPrompt = ai.definePrompt({
  name: 'generateLogSuggestionPrompt',
  input: { schema: GenerateLogSuggestionInputSchema },
  output: { schema: GenerateLogSuggestionOutputSchema },
  prompt: `You are an AI assistant helping a student write their daily attachment logs.
Based on their *previous* log entry, create a short, forward-looking placeholder text for their *new* log entry.

The suggestion should imply a continuation or follow-up of the previous day's work. Frame it as a starting point for their new entry.
Keep it concise (1-2 sentences).

For example, if the previous log was "I designed the database schema for the user authentication module", a good suggestion would be "Continued with the backend implementation for user authentication, focusing on..."

Previous Log Content:
{{{previousLogContent}}}
`,
});


// Define the flow
const generateLogSuggestionFlow = ai.defineFlow(
  {
    name: 'generateLogSuggestionFlow',
    inputSchema: GenerateLogSuggestionInputSchema,
    outputSchema: GenerateLogSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await generateLogSuggestionPrompt(input);
    return output!;
  }
);


// Define the main function that calls the flow
export async function generateLogSuggestion(input: GenerateLogSuggestionInput): Promise<GenerateLogSuggestionOutput> {
  return generateLogSuggestionFlow(input);
}
