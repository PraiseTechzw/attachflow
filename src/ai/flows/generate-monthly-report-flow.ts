'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a CUT-compliant monthly report.
 *
 * It exports:
 * - `generateMonthlyReport`: An asynchronous function to generate the report sections.
 */

import { ai } from '@/ai/genkit';
import { 
  MonthlyReportInputSchema, 
  MonthlyReportOutputSchema,
  type MonthlyReportInput,
  type MonthlyReportOutput
} from './generate-monthly-report-flow-shared';

const generateMonthlyReportPrompt = ai.definePrompt({
  name: 'generateMonthlyReportPrompt',
  input: { schema: MonthlyReportInputSchema },
  output: { schema: MonthlyReportOutputSchema },
  prompt: `You are an AI assistant creating a student's monthly industrial attachment report based on Chinhoyi University of Technology (CUT) guidelines.

Analyze the provided daily logs for the month and generate content for the following five sections:

1.  **Introduction/Summary**: Write a summary of the month's work. {{#if previousConclusion}}Crucially, it must show continuation from the previous month's conclusion, which was: "{{previousConclusion}}". Start by addressing how this month's work builds upon the previous month's ending point.{{/if}} Introduce the key themes, projects, and major milestones achieved this month.
2.  **Relevant Duties and/or Activities**: Synthesize all log entries into a cohesive narrative detailing tasks performed, technologies used, and progress made. Write in professional, full paragraphs.
3.  **Problems**: Scan the logs for mentions of "challenges," "issues," "errors," "bugs," or "problems." List them clearly. If none are found, state "No significant problems were encountered this month."
4.  **Analysis**: Analyze the problems identified. Discuss their impact and how they were resolved. If there were no problems, provide a short reflection on why the month went smoothly and what factors contributed to the success.
5.  **Conclusion**: Write a brief, forward-looking conclusion summarizing key accomplishments and stating the likely focus for the next month. This conclusion will be used as context for the next report.

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
