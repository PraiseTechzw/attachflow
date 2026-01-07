import { z } from 'genkit';

export const ExtractSkillsInputSchema = z.object({
  logContent: z.string().describe('The full text content of the daily log entry.'),
});
export type ExtractSkillsInput = z.infer<typeof ExtractSkillsInputSchema>;

export const ExtractSkillsOutputSchema = z.object({
  skills: z.array(z.string()).describe('A list of unique technical and soft skills mentioned in the log. Examples: "React", "JavaScript", "Project Management", "Communication".'),
});
export type ExtractSkillsOutput = z.infer<typeof ExtractSkillsOutputSchema>;
