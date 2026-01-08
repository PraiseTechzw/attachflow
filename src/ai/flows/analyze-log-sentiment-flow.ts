
'use server';

import { ai } from '@/ai/genkit';
import {
  AnalyzeLogSentimentInputSchema,
  AnalyzeLogSentimentOutputSchema,
  type AnalyzeLogSentimentInput,
  type AnalyzeLogSentimentOutput
} from './analyze-log-sentiment-flow-shared';

const analyzeLogSentimentPrompt = ai.definePrompt({
    name: 'analyzeLogSentimentPrompt',
    input: { schema: AnalyzeLogSentimentInputSchema },
    output: { schema: AnalyzeLogSentimentOutputSchema },
    prompt: `You are an AI assistant that analyzes text for its emotional tone.
Based on the following daily log entry, classify the overall sentiment as "Positive", "Neutral", or "Negative".

- **Positive**: The user expresses excitement, accomplishment, satisfaction, or overcomes a challenge successfully.
- **Neutral**: The user states facts, describes a process without strong emotion, or is objective.
- **Negative**: The user expresses frustration, confusion, difficulty, or mentions unresolved problems or stress.

Log Content:
{{{logContent}}}

Please analyze the sentiment:`
});

const analyzeLogSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeLogSentimentFlow',
    inputSchema: AnalyzeLogSentimentInputSchema,
    outputSchema: AnalyzeLogSentimentOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeLogSentimentPrompt(input);
    return output!;
  }
);


export async function analyzeLogSentiment(input: AnalyzeLogSentimentInput): Promise<AnalyzeLogSentimentOutput> {
  try {
    const result = await analyzeLogSentimentFlow(input);
    return AnalyzeLogSentimentOutputSchema.parse(result);
  } catch (error) {
    console.error('Error analyzing log sentiment:', error);
    
    // Return neutral sentiment as fallback
    return {
      sentiment: "Neutral"
    };
  }
}
