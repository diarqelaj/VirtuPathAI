import OpenAI from 'openai'; 

export const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1', // OpenRouter endpoint
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000', // your actual domain in production
    'X-Title': 'my-nextjs-chat',
  },
});
