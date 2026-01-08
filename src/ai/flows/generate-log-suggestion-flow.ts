'use server';

import { ai } from '@/ai/genkit';
import {
  GenerateLogSuggestionInputSchema,
  GenerateLogSuggestionOutputSchema,
  type GenerateLogSuggestionInput,
  type GenerateLogSuggestionOutput
} from './generate-log-suggestion-flow-shared';

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

export async function generateLogSuggestion(input: GenerateLogSuggestionInput): Promise<GenerateLogSuggestionOutput> {
  return generateLogSuggestionFlow(input);
}
