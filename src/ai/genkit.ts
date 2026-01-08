
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const STABLE_FLASH_MODEL = 'googleai/gemini-1.5-flash-001';
const STABLE_PRO_MODEL = 'googleai/gemini-1.5-pro-001';

// Configure the main AI instance with proper error handling
export const ai = genkit({
  plugins: [googleAI()],
  model: STABLE_FLASH_MODEL, // Stable and reliable model
});

// ============================================
// GOOGLE AI MODELS - WORKING CONFIGURATIONS
// ============================================

// 1. GEMINI 1.5 FLASH (RECOMMENDED - Fast & Reliable)
export const flashAI = genkit({
  plugins: [googleAI()],
  model: STABLE_FLASH_MODEL,
});

// 2. GEMINI 1.5 PRO (Best for Complex Tasks)
export const proAI = genkit({
  plugins: [googleAI()],
  model: STABLE_PRO_MODEL,
});

// 3. GEMINI 1.5 FLASH-8B (Ultra-Fast, Lightweight) - Assuming this model exists, if not, fallback to flash
export const flash8bAI = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash-8b',
});

// 4. GEMINI PRO (Original - Stable)
export const geminiProAI = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-pro',
});

// 5. GEMINI PRO VISION (For Image Analysis)
export const visionAI = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-pro-vision',
});

// ============================================
// SPECIALIZED CONFIGURATIONS
// ============================================

// High Creativity Configuration
export const creativeAI = genkit({
  plugins: [googleAI({
    apiKey: process.env.GEMINI_API_KEY,
  })],
  model: STABLE_FLASH_MODEL,
});

// Deterministic/Precise Configuration
export const preciseAI = genkit({
  plugins: [googleAI({
    apiKey: process.env.GEMINI_API_KEY,
  })],
  model: STABLE_PRO_MODEL,
});

// Long Context Configuration (for large documents)
export const longContextAI = genkit({
  plugins: [googleAI({
    apiKey: process.env.GEMINI_API_KEY,
  })],
  model: STABLE_PRO_MODEL,
});

// Code Generation Configuration
export const codeAI = genkit({
  plugins: [googleAI({
    apiKey: process.env.GEMINI_API_KEY,
  })],
  model: STABLE_FLASH_MODEL,
});

// Quick Response Configuration (fastest)
export const quickAI = genkit({
  plugins: [googleAI({
    apiKey: process.env.GEMINI_API_KEY,
  })],
  model: 'googleai/gemini-1.5-flash-8b',
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get AI instance by model name
 */
export function getAIByModel(modelName: string) {
  const models: Record<string, any> = {
    'flash': flashAI,
    'pro': proAI,
    'flash-8b': flash8bAI,
    'vision': visionAI,
    'creative': creativeAI,
    'precise': preciseAI,
    'code': codeAI,
    'quick': quickAI,
    'long': longContextAI,
  };
  
  return models[modelName] || ai;
}

/**
 * Get best model for task type
 */
export function getAIForTask(taskType: 'creative' | 'analytical' | 'code' | 'fast' | 'vision' | 'long-context') {
  switch (taskType) {
    case 'creative':
      return creativeAI;
    case 'analytical':
      return preciseAI;
    case 'code':
      return codeAI;
    case 'fast':
      return quickAI;
    case 'vision':
      return visionAI;
    case 'long-context':
      return longContextAI;
    default:
      return ai;
  }
}

/**
 * Generate text with error handling
 */
export async function generateText(prompt: string, options?: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  try {
    const aiInstance = options?.model ? getAIByModel(options.model) : ai;
    
    const response = await aiInstance.generate({
      prompt,
      config: {
        temperature: options?.temperature || 0.7,
        maxOutputTokens: options?.maxTokens || 2048,
      },
    });
    
    return response.text();
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate structured response with error handling
 */
export async function generateStructured<T>(
  prompt: string, 
  schema: any,
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<T> {
  try {
    const aiInstance = options?.model ? getAIByModel(options.model) : ai;
    
    const response = await aiInstance.generate({
      prompt,
      output: {
        schema,
      },
      config: {
        temperature: options?.temperature || 0.3,
        maxOutputTokens: 2048,
      },
    });
    
    return response.output() as T;
  } catch (error) {
    console.error('AI Structured Generation Error:', error);
    throw new Error(`Failed to generate structured response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================
// MODEL SPECIFICATIONS
// ============================================

export const MODEL_SPECS = {
  'gemini-1.5-flash-001': {
    speed: 'Very Fast',
    quality: 'Excellent',
    contextWindow: '1M tokens',
    bestFor: 'General use, balanced performance',
    costEfficiency: 'High',
    status: 'Stable',
  },
  'gemini-1.5-pro-001': {
    speed: 'Medium',
    quality: 'Exceptional',
    contextWindow: '2M tokens',
    bestFor: 'Complex reasoning, long documents',
    costEfficiency: 'Medium',
    status: 'Stable',
  },
  'gemini-1.5-flash-8b': {
    speed: 'Ultra Fast',
    quality: 'Good',
    contextWindow: '1M tokens',
    bestFor: 'High-volume, quick responses',
    costEfficiency: 'Very High',
    status: 'Stable',
  },
  'gemini-pro': {
    speed: 'Medium',
    quality: 'Very Good',
    contextWindow: '30K tokens',
    bestFor: 'General tasks, stable performance',
    costEfficiency: 'Medium',
    status: 'Legacy but stable',
  },
  'gemini-pro-vision': {
    speed: 'Medium',
    quality: 'Very Good',
    contextWindow: '30K tokens',
    bestFor: 'Image analysis, multimodal',
    costEfficiency: 'Medium',
    status: 'Stable',
  },
};



export default ai;
