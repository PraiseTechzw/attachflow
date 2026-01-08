
'use server';

import { ai } from '@/ai/genkit';
import {
  ExtractSkillsInputSchema,
  ExtractSkillsOutputSchema,
  type ExtractSkillsInput,
  type ExtractSkillsOutput
} from './extract-skills-from-log-flow-shared';

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

Please extract the skills:`
});

const extractSkillsFlow = ai.defineFlow(
  {
    name: 'extractSkillsFlow',
    inputSchema: ExtractSkillsInputSchema,
    outputSchema: ExtractSkillsOutputSchema,
  },
  async (input) => {
    const { output } = await extractSkillsPrompt(input);
    return output!;
  }
);


export async function extractSkillsFromLog(input: ExtractSkillsInput): Promise<ExtractSkillsOutput> {
  try {
    const result = await extractSkillsFlow(input);
    return ExtractSkillsOutputSchema.parse(result);
  } catch (error) {
    console.error('Error extracting skills from log:', error);
    
    // Return empty skills array as fallback
    return {
      skills: []
    };
  }
}
