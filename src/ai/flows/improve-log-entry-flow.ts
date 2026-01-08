'use server';

import { getServerAI } from '@/ai/server-genkit';
import {
  ImproveLogEntryInputSchema,
  ImproveLogEntryOutputSchema,
  type ImproveLogEntryInput,
  type ImproveLogEntryOutput
} from './improve-log-entry-flow-shared';

export async function improveLogEntry(input: ImproveLogEntryInput): Promise<ImproveLogEntryOutput> {
  try {
    // Validate input
    const validatedInput = ImproveLogEntryInputSchema.parse(input);
    
    // Create AI instance
    const ai = getServerAI();
    
    // Define the prompt
    const prompt = `You are a diligent student who has just received constructive feedback on your daily industrial attachment log. Your task is to rewrite your original log entry to incorporate the supervisor's suggestions.

**Original Log Entry:**
"${validatedInput.logContent}"

**Supervisor's Critique:**
- **Technical Depth Feedback (Score: ${validatedInput.critique.technicalDepth.score}/10):** ${validatedInput.critique.technicalDepth.feedback}
- **Professional Tone Feedback (Score: ${validatedInput.critique.professionalTone.score}/10):** ${validatedInput.critique.professionalTone.feedback}
- **Problem-Solving Clarity Feedback (Score: ${validatedInput.critique.problemSolvingClarity.score}/10):** ${validatedInput.critique.problemSolvingClarity.feedback}

Based *only* on the feedback above, rewrite the original log entry.
- Enhance the technical details as suggested.
- Adopt a more professional tone.
- Clarify any problem-solving steps.
- Do not invent new activities. Stick to the events in the original log.

Please provide the improved version of the log:`;

    // Generate response
    const response = await ai.generate({
      prompt,
      output: {
        schema: ImproveLogEntryOutputSchema,
      },
      config: {
        temperature: 0.5,
        maxOutputTokens: 1000,
      },
    });

    const result = response.output() as ImproveLogEntryOutput;
    
    // Validate output
    return ImproveLogEntryOutputSchema.parse(result);
    
  } catch (error) {
    console.error('Error improving log entry:', error);
    
    // Return original content as fallback
    return {
      improvedLogContent: validatedInput.logContent + "\n\n[Note: Unable to generate improvements at this time. Please try again later.]"
    };
  }
}