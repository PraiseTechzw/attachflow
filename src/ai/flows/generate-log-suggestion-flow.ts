'use server';

import { getServerAI } from '@/ai/server-genkit';
import {
  GenerateLogSuggestionInputSchema,
  GenerateLogSuggestionOutputSchema,
  type GenerateLogSuggestionInput,
  type GenerateLogSuggestionOutput
} from './generate-log-suggestion-flow-shared';

export async function generateLogSuggestion(input: GenerateLogSuggestionInput): Promise<GenerateLogSuggestionOutput> {
  try {
    // Validate input
    const validatedInput = GenerateLogSuggestionInputSchema.parse(input);
    
    // Create AI instance
    const ai = getServerAI();
    
    // Define the prompt
    const prompt = `You are an AI assistant helping a student write their daily attachment logs.
Based on their *previous* log entry, create a short, forward-looking placeholder text for their *new* log entry.

The suggestion should imply a continuation or follow-up of the previous day's work. Frame it as a starting point for their new entry.
Keep it concise (1-2 sentences).

For example, if the previous log was "I designed the database schema for the user authentication module", a good suggestion would be "Continued with the backend implementation for user authentication, focusing on..."

Previous Log Content:
${validatedInput.previousLogContent}

Please provide a suggestion for the next log entry:`;

    // Generate response
    const response = await ai.generate({
      prompt,
      output: {
        schema: GenerateLogSuggestionOutputSchema,
      },
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const result = response.output() as GenerateLogSuggestionOutput;
    
    // Validate output
    return GenerateLogSuggestionOutputSchema.parse(result);
    
  } catch (error) {
    console.error('Error generating log suggestion:', error);
    
    // Return a fallback suggestion
    return {
      suggestion: "Continue working on today's tasks and document your progress, challenges, and learnings."
    };
  }
}
