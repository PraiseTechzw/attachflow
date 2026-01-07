'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating feedback on student daily logs using Google Gemini.
 *
 * It exports:
 * - `generateLogFeedback`: An asynchronous function to generate feedback on a given log.
 * - `GenerateLogFeedbackInput`: The TypeScript interface for the input to the `generateLogFeedback` function.
 * - `GenerateLogFeedbackOutput`: The TypeScript interface for the output of the `generateLogFeedback` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const GenerateLogFeedbackInputSchema = z.object({
  logText: z.string().describe('The text content of the daily log.'),
  studentGoals: z.string().describe('The student attachment goals.'),
});
export type GenerateLogFeedbackInput = z.infer<typeof GenerateLogFeedbackInputSchema>;

// Define the output schema for the flow
const GenerateLogFeedbackOutputSchema = z.object({
  feedback: z.string().describe('The AI-generated feedback on the daily log.'),
});
export type GenerateLogFeedbackOutput = z.infer<typeof GenerateLogFeedbackOutputSchema>;

// Define the main function that calls the flow
export async function generateLogFeedback(input: GenerateLogFeedbackInput): Promise<GenerateLogFeedbackOutput> {
  return generateLogFeedbackFlow(input);
}

// Define the prompt
const generateLogFeedbackPrompt = ai.definePrompt({
  name: 'generateLogFeedbackPrompt',
  input: {schema: GenerateLogFeedbackInputSchema},
  output: {schema: GenerateLogFeedbackOutputSchema},
  prompt: `You are an AI assistant providing feedback on student daily logs during their industrial attachment.

  The student has the following goals: {{{studentGoals}}}

  Provide constructive feedback on the following daily log, suggesting improvements to better meet their attachment goals:

  {{{logText}}}

  Focus on actionable suggestions and areas for improvement.
  `,
});

// Define the flow
const generateLogFeedbackFlow = ai.defineFlow(
  {
    name: 'generateLogFeedbackFlow',
    inputSchema: GenerateLogFeedbackInputSchema,
    outputSchema: GenerateLogFeedbackOutputSchema,
  },
  async input => {
    const {output} = await generateLogFeedbackPrompt(input);
    return output!;
  }
);
