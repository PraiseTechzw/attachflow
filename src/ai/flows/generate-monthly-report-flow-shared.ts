
import { z } from 'genkit';

const LogEntrySchema = z.object({
  date: z.string().describe('The date of the log entry as an ISO 8601 string.'),
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
