'use server';

import { getServerAI } from '@/ai/server-genkit';
import {
  AnalyzeLogSentimentInputSchema,
  AnalyzeLogSentimentOutputSchema,
  type AnalyzeLogSentimentInput,
  type AnalyzeLogSentimentOutput
} from './analyze-log-sentiment-flow-shared';

export async function analyzeLogSentiment(input: AnalyzeLogSentimentInput): Promise<AnalyzeLogSentimentOutput> {
  try {
    // Validate input
    const validatedInput = AnalyzeLogSentimentInputSchema.parse(input);
    
    // Create AI instance
    const ai = getServerAI();
    
    // Define the prompt
    const prompt = `You are an AI assistant that analyzes text for its emotional tone.
Based on the following daily log entry, classify the overall sentiment as "Positive", "Neutral", or "Negative".

- **Positive**: The user expresses excitement, accomplishment, satisfaction, or overcomes a challenge successfully.
- **Neutral**: The user states facts, describes a process without strong emotion, or is objective.
- **Negative**: The user expresses frustration, confusion, difficulty, or mentions unresolved problems or stress.

Log Content:
${validatedInput.logContent}

Please analyze the sentiment:`;

    // Generate response
    const response = await ai.generate({
      prompt,
      output: {
        schema: AnalyzeLogSentimentOutputSchema,
      },
      config: {
        temperature: 0.3,
        maxOutputTokens: 200,
      },
    });

    const result = response.output() as AnalyzeLogSentimentOutput;
    
    // Validate output
    return AnalyzeLogSentimentOutputSchema.parse(result);
    
  } catch (error) {
    console.error('Error analyzing log sentiment:', error);
    
    // Return neutral sentiment as fallback
    return {
      sentiment: "Neutral"
    };
  }
}