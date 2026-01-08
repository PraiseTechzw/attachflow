
'use server';

/**
 * @fileOverview This file defines a Genkit flow for polishing a raw daily log entry
 * into a professional and well-written version.
 *
 * It exports:
 * - `polishLogEntry`: An asynchronous function to polish the log content.
 */

import { ai } from '@/ai/genkit';
import {
  PolishLogEntryInputSchema,
  PolishLogEntryOutputSchema,
  type PolishLogEntryInput,
  type PolishLogEntryOutput
} from './polish-log-entry-flow-shared';

const polishLogEntryPrompt = ai.definePrompt({
    name: 'polishLogEntryPrompt',
    input: { schema: PolishLogEntryInputSchema },
    output: { schema: PolishLogEntryOutputSchema },
    prompt: `You are an AI assistant that acts as a language expert, specializing in professional and technical writing.
Your task is to rewrite a student's raw daily log entry into a polished, professional version suitable for an industrial attachment report.

**Instructions:**
1.  **Correct Grammar and Spelling:** Fix any grammatical errors, spelling mistakes, and typos.
2.  **Improve Clarity and Conciseness:** Rephrase sentences to be clearer and more direct.
3.  **Use Professional Terminology:** Replace casual language with industry-standard terminology. For example, change "fixed a bug" to "resolved a software defect" or "debugged an issue."
4.  **Structure the Content:** This is crucial. Format the output as a well-indented, multi-level bulleted list. Each main task should be a top-level bullet point. Sub-tasks or further details should be nested and indented underneath the main bullet.

**Example of desired format:**
- Implemented the user authentication backend endpoint.
  - Developed the API route for user sign-up and login.
  - Integrated JWT for session management.
- Debugged a critical issue in the payment processing module.
  - Traced the error to a third-party API rate limit.
  - Implemented a retry mechanism with exponential backoff.

5.  **Maintain Key Information:** Ensure all original activities, accomplishments, and challenges are retained. Do not add new information.

**Raw Log Content:**
{{{logContent}}}

Please rewrite this content into a polished, professional, and well-structured version:
`
});

const polishLogEntryFlow = ai.defineFlow(
  {
    name: 'polishLogEntryFlow',
    inputSchema: PolishLogEntryInputSchema,
    outputSchema: PolishLogEntryOutputSchema,
  },
  async (input) => {
    const { output } = await polishLogEntryPrompt(input);
    return output!;
  }
);


export async function polishLogEntry(input: PolishLogEntryInput): Promise<PolishLogEntryOutput> {
  try {
    const result = await polishLogEntryFlow(input);
    return PolishLogEntryOutputSchema.parse(result);
  } catch (error) {
    console.error('Error polishing log entry:', error);
    
    // Return original content as fallback
    return {
      polishedContent: input.logContent + "\n\n[Note: Unable to polish content at this time. Please try again later.]"
    };
  }
}
