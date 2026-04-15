/**
 * Deprecated path: frontend-side AI runtime is intentionally not used
 * in production flows. Laravel backend remains the single AI orchestrator.
 * Keep this file only for historical compatibility.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
