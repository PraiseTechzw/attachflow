'use server';
import { config } from 'dotenv';
config();

import { ai } from '@/ai/genkit';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

async function runTest() {
  console.log('Running AI configuration test...');
  
  // Use a separate instance for testing to ensure config is clean
  const testAi = genkit({
    plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  });

  try {
    const response = await testAi.generate({
      model: 'googleai/gemini-pro',
      prompt: 'Say "Hello, World!" in a friendly and encouraging tone.',
      config: {
        temperature: 0.7,
      },
    });

    console.log('✅ AI Test Successful!');
    console.log('Model Response:', response.text);
    console.log('\nYour API key and model configuration are working correctly.');
  } catch (error) {
    console.error('❌ AI Test Failed!');
    console.error('There was an error connecting to the AI model. Please check the following:');
    console.error('1. Ensure you have replaced "YOUR_API_KEY_HERE" in the .env file with your actual Gemini API key.');
    console.error('2. Verify that your API key is valid and has the necessary permissions.');
    console.error('Full error details:', error);
  }
}

runTest();
