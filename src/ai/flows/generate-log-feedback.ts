'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating feedback on student daily logs using Google Gemini.
 *
 * It exports:
 * - `generateLogFeedback`: An asynchronous function to generate feedback on a given log.
 * - `GenerateLogFeedbackInput`: The TypeScript interface for the input to the `generateLogfeedback` function.
 * - `GenerateLogFeedbackOutput`: The TypeScript interface for the output of the `generateLogfeedback` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const GenerateLogFeedbackInputSchema = z.object({
  logText: z.string().describe('The text content of the daily log.'),
  studentGoals: z.string().describe('The student attachment goals.'),
});
export type GenerateLogFeedbackInput = z.infer<typeof GenerateLogFeedbackInputSchema>;


const ScorecardItemSchema = z.object({
  score: z.number().min(1).max(10).describe("The score from 1-10 for this criterion."),
  feedback: z.string().describe("Specific, constructive feedback for this criterion.")
});

// Define the output schema for the flow
const GenerateLogFeedbackOutputSchema = z.object({
  technicalDepth: ScorecardItemSchema.describe("Evaluation of the log's technical detail and substance."),
  professionalTone: ScorecardItemSchema.describe("Evaluation of the log's tone, language, and professionalism."),
  problemSolvingClarity: ScorecardItemSchema.describe("Evaluation of how clearly the log describes problems and the steps taken to solve them."),
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
  prompt: `You are an AI assistant acting as a strict but fair University Supervisor, providing feedback on a student's daily log during their industrial attachment.

  The student has the following goals for their attachment: {{{studentGoals}}}

  Your task is to analyze the log entry provided and evaluate it based on three criteria. For each criterion, provide a score from 1 to 10 and detailed, constructive feedback on how to improve.

  1.  **Technical Depth (Score/10):** How detailed is the log? Does it just list tasks, or does it explain the 'how' and 'why'? Rate it higher for including specific technologies, code snippets, or technical challenges.
  2.  **Professional Tone (Score/10):** Is the language professional and clear? Or is it too casual or vague? Rate it higher for clear, concise, and objective descriptions of activities.
  3.  **Problem-Solving Clarity (Score/10):** When a problem or challenge is mentioned, is the resolution process clear? Does the student explain what they tried, what worked, and what they learned? If no problems are mentioned, this score can reflect the clarity of the overall work process.

  Analyze the following daily log:

  "{{{logText}}}"

  Provide your evaluation in the structured format required.
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
