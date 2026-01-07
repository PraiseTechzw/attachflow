'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-log-feedback.ts';
import '@/ai/flows/generate-final-report-flow.ts';
import '@/ai/flows/generate-log-suggestion-flow.ts';
import '@/ai/flows/extract-skills-from-log-flow.ts';
