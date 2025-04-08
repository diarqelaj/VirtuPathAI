import OpenAI from 'openai';

export const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1', // ✅ Required for OpenRouter
  apiKey: process.env.OPENROUTER_API_KEY || '', // Set this in your `.env.local`
  defaultHeaders: {
    'HTTP-Referer': 'https://virtu-path-ai.vercel.app/', // 🔐 Optional but recommended
    'X-Title': 'VirtuPath AI Chatbot',
  },
});
