'use server';

/**
 * @fileOverview This file defines a Genkit flow for polishing a raw daily log entry
 * into a professional and well-written version.
 *
 * It exports:
 * - `polishLogEntry`: An asynchronous function to polish the log content.
 * - `PolishLogEntryInput`: The TypeScript interface for the input.
 * - `PolishLogEntryOutput`: The TypeScript interface for the output.
 */

import { getServerAI } from '@/ai/server-genkit';
import {
  PolishLogEntryInputSchema,
  PolishLogEntryOutputSchema,
  type PolishLogEntryInput,
  type PolishLogEntryOutput
} from './polish-log-entry-flow-shared';

export async function polishLogEntry(input: PolishLogEntryInput): Promise<PolishLogEntryOutput> {
  try {
    // Validate input
    const validatedInput = PolishLogEntryInputSchema.parse(input);
    
    // Create AI instance
    const ai = getServerAI();
    
    // Define the prompt
    const prompt = `You are an AI assistant that acts as a language expert, specializing in professional and technical writing.
Your task is to rewrite a student's raw daily log entry into a polished, professional version suitable for an industrial attachment report.

**Instructions:**
1. **Correct Grammar and Spelling:** Fix any grammatical errors, spelling mistakes, and typos.
2. **Improve Clarity and Conciseness:** Rephrase sentences to be clearer and more direct.
3. **Use Professional Terminology:** Replace casual language with industry-standard terminology. For example, change "fixed a bug" to "resolved a software defect" or "debugged an issue."
4. **Structure the Content:** Organize the text into a logical flow. Use bullet points or short paragraphs if it improves readability.
5. **Maintain Key Information:** Ensure all original activities, accomplishments, and challenges are retained. Do not add new information.

**Raw Log Content:**
${validatedInput.logContent}

Please rewrite this content into a polished, professional version:`;

    // Generate response
    const response = await ai.generate({
      prompt,
      output: {
        schema: PolishLogEntryOutputSchema,
      },
      config: {
        temperature: 0.4,
        maxOutputTokens: 1000,
      },
    });

    const result = response.output;
    
    // Validate output
    return PolishLogEntryOutputSchema.parse(result);
    
  } catch (error) {
    console.error('Error polishing log entry:', error);
    
    // Return original content as fallback
    return {
      polishedContent: input.logContent + "\n\n[Note: Unable to polish content at this time. Please try again later.]"
    };
  }
}