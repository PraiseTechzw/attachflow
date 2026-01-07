'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting technical and soft skills from a daily log.
 *
 * It exports:
 * - `extractSkillsFromLog`: An asynchronous function to extract skills.
 * - `ExtractSkillsInput`: The TypeScript interface for the input.
 * - `ExtractSkillsOutput`: The TypeScript interface for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input schema for the flow
export const ExtractSkillsInputSchema = z.object({
  logContent: z.string().describe('The full text content of the daily log entry.'),
});
export type ExtractSkillsInput = z.infer<typeof ExtractSkillsInputSchema>;

// Define the output schema for the flow
export const ExtractSkillsOutputSchema = z.object({
  skills: z.array(z.string()).describe('A list of unique technical and soft skills mentioned in the log. Examples: "React", "JavaScript", "Project Management", "Communication".'),
});
export type ExtractSkillsOutput = z.infer<typeof ExtractSkillsOutputSchema>;


const extractSkillsPrompt = ai.definePrompt({
  name: 'extractSkillsPrompt',
  input: { schema: ExtractSkillsInputSchema },
  output: { schema: ExtractSkillsOutputSchema },
  prompt: `You are an AI assistant that analyzes text to identify skills.
Based on the following daily log entry, extract a list of key technical and soft skills.

Focus on specific, marketable skills. For example, instead of "fixed bugs," extract the specific technology like "JavaScript Debugging."
Instead of "talked to my manager", extract "Communication".

Log Content:
{{{logContent}}}
`,
});

// Define the flow
const extractSkillsFlow = ai.defineFlow(
  {
    name: 'extractSkillsFromLogFlow',
    inputSchema: ExtractSkillsInputSchema,
    outputSchema: ExtractSkillsOutputSchema,
  },
  async (input) => {
    const { output } = await extractSkillsPrompt(input);
    return output!;
  }
);

// Define the main function that calls the flow
export async function extractSkillsFromLog(input: ExtractSkillsInput): Promise<ExtractSkillsOutput> {
  return extractSkillsFlow(input);
}
