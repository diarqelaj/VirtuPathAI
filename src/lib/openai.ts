// lib/openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://yourdomain.com/', // ✅ Replace with your actual domain
    'X-Title': 'ViruPath AI Chatbot',
  },
});
