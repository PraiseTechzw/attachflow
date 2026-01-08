
'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

/**
 * ============================================
 * SINGLE RELIABLE AI CONFIGURATION
 * ============================================
 * To prevent model availability errors, we are consolidating all AI
 * functionality to use a single, powerful, and stable model.
 */

const reliableModel = 'googleai/gemini-1.5-pro';

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: reliableModel, // Set the default model for all generate() calls
});


/**
 * ============================================
 * UNIFIED UTILITY FUNCTIONS
 * ============================================
 * These functions now use the single, reliable AI instance for all tasks.
 */

/**
 * Generate text with error handling.
 */
export async function generateText(prompt: string, options?: {
  temperature?: number;
  maxTokens?: number;
}) {
  try {
    const response = await ai.generate({
      prompt,
      config: {
        temperature: options?.temperature || 0.7,
        maxOutputTokens: options?.maxTokens || 4096,
      },
    });
    
    return response.text();
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate structured response with error handling.
 */
export async function generateStructured<T>(
  prompt: string, 
  schema: z.ZodSchema<T>,
  options?: {
    temperature?: number;
  }
): Promise<T> {
  try {
    const response = await ai.generate({
      prompt,
      output: {
        schema,
      },
      config: {
        temperature: options?.temperature || 0.3,
        maxOutputTokens: 4096,
      },
    });
    
    const output = response.output();
    if (output === null || output === undefined) {
      throw new Error('AI returned null or undefined structured output.');
    }
    return output;
  } catch (error) {
    console.error('AI Structured Generation Error:', error);
    throw new Error(`Failed to generate structured response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export default ai;
