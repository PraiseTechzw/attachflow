'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a CUT-compliant monthly report.
 *
 * It exports:
 * - `generateMonthlyReport`: An asynchronous function to generate the report sections.
 * - `MonthlyReportInput`: The TypeScript interface for the input.
 * - `MonthlyReportOutput`: The TypeScript interface for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// We don't need to define the whole DailyLog schema here, just the parts we use.
const LogEntrySchema = z.object({
  date: z.any().describe('The date of the log entry.'),
  content: z.string().describe('The content of the log entry.'),
});

// Define the input schema for the flow
export const MonthlyReportInputSchema = z.object({
  logs: z.array(LogEntrySchema).describe('An array of all daily logs for the month.'),
  previousConclusion: z.string().optional().describe('The conclusion from the previous month\'s report for context.'),
});
export type MonthlyReportInput = z.infer<typeof MonthlyReportInputSchema>;

// Define the output schema for the flow
export const MonthlyReportOutputSchema = z.object({
  introduction: z.string().describe('A summary introduction for the month. It should cover the main themes and achievements of the month and show continuation from the previous month if its conclusion is provided.'),
  duties: z.string().describe('A summarized paragraph of all relevant duties and activities performed during the month, written in a professional tone.'),
  problems: z.string().describe('A bulleted or numbered list of specific problems and challenges encountered, extracted directly from the logs. If no challenges are mentioned, state that.'),
  analysis: z.string().describe('An analysis of the problems encountered, discussing their impact on the project or learning process. If no problems, this can be a general reflection on why the month went smoothly.'),
  conclusion: z.string().describe('A concise conclusion summarizing the months achievements and setting the stage for the next month.'),
});
export type MonthlyReportOutput = z.infer<typeof MonthlyReportOutputSchema>;

const generateMonthlyReportPrompt = ai.definePrompt({
  name: 'generateMonthlyReportPrompt',
  input: { schema: MonthlyReportInputSchema },
  output: { schema: MonthlyReportOutputSchema },
  prompt: `You are an AI assistant creating a student's monthly industrial attachment report based on Chinhoyi University of Technology (CUT) guidelines.

Analyze the provided daily logs for the month and generate content for the following five sections:

1.  **Introduction/Summary**: Write a summary of the month's work. {{#if previousConclusion}}It must show continuation from the previous month's conclusion, which was: "{{previousConclusion}}".{{/if}} Introduce the key themes, projects, and major milestones achieved this month.
2.  **Relevant Duties and/or Activities**: Synthesize all log entries into a cohesive narrative detailing tasks performed, technologies used, and progress made.
3.  **Problems**: Scan the logs for mentions of "challenges," "issues," "errors," "bugs," or "problems." List them clearly. If none are found, state "No significant problems were encountered this month."
4.  **Analysis**: Analyze the problems identified. Discuss their impact and how they were resolved. If there were no problems, provide a short reflection on why the month went smoothly.
5.  **Conclusion**: Write a brief, forward-looking conclusion summarizing key accomplishments and stating the likely focus for the next month.

**Daily Logs for the Month:**
{{#each logs}}
- **{{date}}**: {{{content}}}
{{/each}}
`,
});

const generateMonthlyReportFlow = ai.defineFlow(
  {
    name: 'generateMonthlyReportFlow',
    inputSchema: MonthlyReportInputSchema,
    outputSchema: MonthlyReportOutputSchema,
  },
  async (input) => {
    // Ensure logs are sorted by date before sending to the prompt
    const sortedLogs = input.logs.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
    });

    const { output } = await generateMonthlyReportPrompt({ ...input, logs: sortedLogs });
    return output!;
  }
);


// Define the main function that calls the flow
export async function generateMonthlyReport(input: MonthlyReportInput): Promise<MonthlyReportOutput> {
  return generateMonthlyReportFlow(input);
}
