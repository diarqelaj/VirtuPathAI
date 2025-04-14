// lib/openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://virtu-path-ai.vercel.app/',
    'X-Title': 'ViruPath AI Chatbot',
  },
});
