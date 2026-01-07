'use server';

/**
 * @fileOverview This file defines a Genkit flow for improving a daily log entry
 * based on specific feedback from a supervisor's critique.
 *
 * It exports:
 * - `improveLogEntry`: An asynchronous function to generate the improved log content.
 * - `ImproveLogEntryInput`: The TypeScript interface for the input.
 * - `ImproveLogEntryOutput`: The TypeScript interface for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GenerateLogFeedbackOutputSchema } from './generate-log-feedback';

// Define the input schema for the flow
export const ImproveLogEntryInputSchema = z.object({
  logContent: z.string().describe('The original, raw text of the daily log entry.'),
  critique: GenerateLogFeedbackOutputSchema.describe('The structured feedback received from the AI Mentor/supervisor.'),
});
export type ImproveLogEntryInput = z.infer<typeof ImproveLogEntryInputSchema>;

// Define the output schema for the flow
export const ImproveLogEntryOutputSchema = z.object({
  improvedContent: z.string().describe('The rewritten, improved version of the log entry that addresses the critique.'),
});
export type ImproveLogEntryOutput = z.infer<typeof ImproveLogEntryOutputSchema>;

const improveLogEntryPrompt = ai.definePrompt({
  name: 'improveLogEntryPrompt',
  input: { schema: ImproveLogEntryInputSchema },
  output: { schema: ImproveLogEntryOutputSchema },
  prompt: `You are a diligent student who has just received constructive feedback on your daily industrial attachment log. Your task is to rewrite your original log entry to incorporate the supervisor's suggestions.

**Original Log Entry:**
"{{{logContent}}}"

**Supervisor's Critique:**
- **Technical Depth Feedback (Score: {{critique.technicalDepth.score}}/10):** {{critique.technicalDepth.feedback}}
- **Professional Tone Feedback (Score: {{critique.professionalTone.score}}/10):** {{critique.professionalTone.feedback}}
- **Problem-Solving Clarity Feedback (Score: {{critique.problemSolvingClarity.score}}/10):** {{critique.problemSolvingClarity.feedback}}

Based *only* on the feedback above, rewrite the original log entry.
- Enhance the technical details as suggested.
- Adopt a more professional tone.
- Clarify any problem-solving steps.
- Do not invent new activities. Stick to the events in the original log.

Produce the improved version of the log.`,
});

const improveLogEntryFlow = ai.defineFlow(
  {
    name: 'improveLogEntryFlow',
    inputSchema: ImproveLogEntryInputSchema,
    outputSchema: ImproveLogEntryOutputSchema,
  },
  async (input) => {
    const { output } = await improveLogEntryPrompt(input);
    return output!;
  }
);

export async function improveLogEntry(input: ImproveLogEntryInput): Promise<ImproveLogEntryOutput> {
  return improveLogEntryFlow(input);
}
