'use server';

import { getServerAI } from '@/ai/server-genkit';
import {
  ExtractSkillsInputSchema,
  ExtractSkillsOutputSchema,
  type ExtractSkillsInput,
  type ExtractSkillsOutput
} from './extract-skills-from-log-flow-shared';

export async function extractSkillsFromLog(input: ExtractSkillsInput): Promise<ExtractSkillsOutput> {
  try {
    // Validate input
    const validatedInput = ExtractSkillsInputSchema.parse(input);
    
    // Create AI instance
    const ai = getServerAI();
    
    // Define the prompt
    const prompt = `You are an AI assistant that analyzes text to identify skills.
Based on the following daily log entry, extract a list of key technical and soft skills.

Focus on specific, marketable skills. For example, instead of "fixed bugs," extract the specific technology like "JavaScript Debugging."
Instead of "talked to my manager", extract "Communication".

Log Content:
${validatedInput.logContent}

Please extract the skills:`;

    // Generate response
    const response = await ai.generate({
      prompt,
      output: {
        schema: ExtractSkillsOutputSchema,
      },
      config: {
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    });

    const result = response.output() as ExtractSkillsOutput;
    
    // Validate output
    return ExtractSkillsOutputSchema.parse(result);
    
  } catch (error) {
    console.error('Error extracting skills from log:', error);
    
    // Return empty skills array as fallback
    return {
      skills: []
    };
  }
}