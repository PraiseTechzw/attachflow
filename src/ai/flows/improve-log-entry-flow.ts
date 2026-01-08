
'use server';

import { getAIForTask } from '@/ai/genkit';
import {
  ImproveLogEntryInputSchema,
  ImproveLogEntryOutputSchema,
  ImproveLogEntryInput,
  ImproveLogEntryOutput
} from './improve-log-entry-flow-shared';

const creativeAI = getAIForTask('creative');

const improveLogEntryPrompt = creativeAI.definePrompt({
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

Produce the improved version of the log.`
});

const improveLogEntryFlow = creativeAI.defineFlow(
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
