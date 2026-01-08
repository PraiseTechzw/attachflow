// Server-side AI configuration for use in server actions
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Server-side AI instance - can be imported in server actions
function createServerAI() {
  return genkit({
    plugins: [googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    })],
    model: 'googleai/gemini-1.5-flash',
  });
}

// Export a function that creates the AI instance
export function getServerAI() {
  return createServerAI();
}

// Utility function for server-side text generation
export async function generateServerText(prompt: string, options?: {
  temperature?: number;
  maxTokens?: number;
}) {
  try {
    const ai = getServerAI();
    
    const response = await ai.generate({
      prompt,
      config: {
        temperature: options?.temperature || 0.7,
        maxOutputTokens: options?.maxTokens || 2048,
      },
    });
    
    return response.text();
  } catch (error) {
    console.error('Server AI Generation Error:', error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Utility function for server-side structured generation
export async function generateServerStructured<T>(
  prompt: string, 
  schema: any,
  options?: {
    temperature?: number;
  }
): Promise<T> {
  try {
    const ai = getServerAI();
    
    const response = await ai.generate({
      prompt,
      output: {
        schema,
      },
      config: {
        temperature: options?.temperature || 0.3,
        maxOutputTokens: 2048,
      },
    });
    
    return response.output() as T;
  } catch (error) {
    console.error('Server AI Structured Generation Error:', error);
    throw new Error(`Failed to generate structured response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}