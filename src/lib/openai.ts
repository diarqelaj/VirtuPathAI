import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000', // Replace with your real domain in production
    'X-Title': 'my-nextjs-chat',             // Optional, shows up in OpenRouter usage dashboard
  },
});
