'use server';

import { ai } from '@/ai/genkit';
import {
  GenerateLogFeedbackInputSchema,
  GenerateLogFeedbackOutputSchema,
  type GenerateLogFeedbackInput,
  type GenerateLogFeedbackOutput
} from './generate-log-feedback-shared';


const generateLogFeedbackPrompt = ai.definePrompt({
    name: 'generateLogFeedbackPrompt',
    input: { schema: GenerateLogFeedbackInputSchema },
    output: { schema: GenerateLogFeedbackOutputSchema },
    prompt: `You are an AI assistant acting as a supportive University Supervisor providing brief, positive feedback on a student's daily log.

Your task is to analyze the log entry and provide a **short, one-sentence supervisor comment**. This comment should be positive and encouraging. Examples: "Good progress noted.", "Well-detailed entry.", "Excellent problem-solving skills demonstrated.", "Clear and concise, well done."

In addition to the comment, also provide a detailed scorecard evaluating the log on three criteria, providing a score from 1 to 10 and constructive feedback for each.

1. **Technical Depth (Score/10):** How detailed is the log?
2. **Professional Tone (Score/10):** Is the language professional?
3. **Problem-Solving Clarity (Score/10):** Are challenges and solutions explained clearly?

Analyze the following daily log:
"{{{logText}}}"

Please provide your complete evaluation including the scorecard and the final, short supervisor comment:`
});


const generateLogFeedbackFlow = ai.defineFlow(
  {
    name: 'generateLogFeedbackFlow',
    inputSchema: GenerateLogFeedbackInputSchema,
    outputSchema: GenerateLogFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await generateLogFeedbackPrompt(input);
    return output!;
  }
);


export async function generateLogFeedback(input: GenerateLogFeedbackInput): Promise<GenerateLogFeedbackOutput> {
  try {
    const result = await generateLogFeedbackFlow(input);
    return GenerateLogFeedbackOutputSchema.parse(result);
  } catch (error) {
    console.error('Error generating log feedback:', error);
    
    // Return default feedback as fallback
    return {
      supervisorComment: "Unable to generate feedback at this time. Please review your log for clarity and detail.",
      technicalDepth: { score: 5, feedback: "Unable to analyze technical depth at this time. Please ensure your log includes specific details about technologies and methods used." },
      professionalTone: { score: 5, feedback: "Unable to analyze professional tone at this time. Please ensure your log uses clear, professional language." },
      problemSolvingClarity: { score: 5, feedback: "Unable to analyze problem-solving clarity at this time. Please include details about challenges faced and how they were resolved." }
    };
  }
}
