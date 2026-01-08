
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
  prompt: `You are an AI assistant tasked with creating a student's detailed, comprehensive, and full-fledged monthly industrial attachment report based on Chinhoyi University of Technology (CUT) guidelines. Your output should be professional and substantial.

Analyze the provided daily logs for the month and generate **in-depth content** for the following five sections:

1.  **Introduction / Summary**: Write a comprehensive introduction.
    - {{#if previousConclusion}}Crucially, start by showing a clear continuation from the previous month's conclusion, which was: "{{previousConclusion}}". Explain how this month's activities build upon or diverge from the previous month's ending point.{{/if}}
    - Introduce the key themes, major projects, and significant milestones of the month in detail. Do not be brief; set the stage for the detailed sections to follow.

2.  **Relevant Duties and/or Activities**: This is the main body of the report and must be highly detailed.
    - Synthesize **all** log entries into a cohesive, well-structured narrative. Do not just list tasks.
    - Group related activities and elaborate on them. Explain the "what," "why," and "how" of the tasks performed.
    - Detail the specific technologies, tools, and methodologies used for each major task.
    - Describe the progress made on projects throughout the month.
    - Write in professional, full paragraphs, creating a rich story of the month's work.

3.  **Problems Encountered**: Scan the logs for any mention of "challenges," "issues," "errors," "bugs," "problems," or difficulties.
    - For each problem, describe it in detail.
    - List the problems clearly, using bullet points for readability.
    - If no explicit problems are mentioned, analyze the logs for potential inefficiencies or areas for improvement and frame them as "Learning Opportunities" or state "No significant problems were encountered this month, leading to smooth project progression."

4.  **Analysis of Problems**: Provide a thorough analysis for each problem identified.
    - Discuss the root cause of the problem.
    - Explain the steps taken to troubleshoot and resolve the issue.
    - Analyze the impact of the problem on the project timeline or your learning.
    - If there were no problems, provide a detailed reflection on the factors contributing to the successful month, such as effective planning, robust code, or good teamwork.

5.  **Conclusion**: Write a strong, forward-looking conclusion.
    - Summarize the key accomplishments and skills gained during the month.
    - Reflect on the overall experience and its contribution to your learning objectives.
    - State the likely focus for the upcoming month, setting a clear agenda. This will be used as context for the next report.

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
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const { output } = await generateMonthlyReportPrompt({ ...input, logs: sortedLogs });
    return output!;
  }
);


// Define the main function that calls the flow
export async function generateMonthlyReport(input: MonthlyReportInput): Promise<MonthlyReportOutput> {
  return generateMonthlyReportFlow(input);
}
