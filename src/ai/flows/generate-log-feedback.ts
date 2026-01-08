'use server';

import { getServerAI } from '@/ai/server-genkit';
import {
  GenerateLogFeedbackInputSchema,
  GenerateLogFeedbackOutputSchema,
  type GenerateLogFeedbackInput,
  type GenerateLogFeedbackOutput
} from './generate-log-feedback-shared';

export async function generateLogFeedback(input: GenerateLogFeedbackInput): Promise<GenerateLogFeedbackOutput> {
  try {
    // Validate input
    const validatedInput = GenerateLogFeedbackInputSchema.parse(input);
    
    // Create AI instance
    const ai = getServerAI();
    
    // Define the prompt
    const prompt = `You are an AI assistant acting as a strict but fair University Supervisor, providing feedback on a student's daily log during their industrial attachment.

The student has the following goals for their attachment: ${validatedInput.studentGoals}

Your task is to analyze the log entry provided and evaluate it based on three criteria. For each criterion, provide a score from 1 to 10 and detailed, constructive feedback on how to improve.

1. **Technical Depth (Score/10):** How detailed is the log? Does it just list tasks, or does it explain the 'how' and 'why'? Rate it higher for including specific technologies, code snippets, or technical challenges.
2. **Professional Tone (Score/10):** Is the language professional and clear? Or is it too casual or vague? Rate it higher for clear, concise, and objective descriptions of activities.
3. **Problem-Solving Clarity (Score/10):** When a problem or challenge is mentioned, is the resolution process clear? Does the student explain what they tried, what worked, and what they learned? If no problems are mentioned, this score can reflect the clarity of the overall work process.

Analyze the following daily log:
"${validatedInput.logText}"

Please provide your evaluation:`;

    // Generate response
    const response = await ai.generate({
      prompt,
      output: {
        schema: GenerateLogFeedbackOutputSchema,
      },
      config: {
        temperature: 0.4,
        maxOutputTokens: 1000,
      },
    });

    const result = response.output() as GenerateLogFeedbackOutput;
    
    // Validate output
    return GenerateLogFeedbackOutputSchema.parse(result);
    
  } catch (error) {
    console.error('Error generating log feedback:', error);
    
    // Return default feedback as fallback
    return {
      technicalDepthScore: 5,
      technicalDepthFeedback: "Unable to analyze technical depth at this time. Please ensure your log includes specific details about technologies and methods used.",
      professionalToneScore: 5,
      professionalToneFeedback: "Unable to analyze professional tone at this time. Please ensure your log uses clear, professional language.",
      problemSolvingScore: 5,
      problemSolvingFeedback: "Unable to analyze problem-solving clarity at this time. Please include details about challenges faced and how they were resolved."
    };
  }
}