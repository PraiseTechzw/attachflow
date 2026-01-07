
'use server';

import {ai} from '@/ai/genkit';
import {
  GenerateLogFeedbackInputSchema,
  GenerateLogFeedbackOutputSchema,
  GenerateLogFeedbackInput,
  GenerateLogFeedbackOutput
} from './generate-log-feedback-shared';

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

export async function generateLogFeedback(input: GenerateLogFeedbackInput): Promise<GenerateLogFeedbackOutput> {
  return generateLogFeedbackFlow(input);
}
