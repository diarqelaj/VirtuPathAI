import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: Message[] = body.messages;

    const systemMessage = messages.find((msg: Message) => msg.role === 'system');
    const websiteContent = systemMessage?.content || '';

    // Fetch the latest models from OpenRouter
    const modelRes = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!modelRes.ok) {
      throw new Error('Failed to fetch models from OpenRouter');
    }

    const modelData = await modelRes.json();

    // Filter free models
    const freeModels = modelData.data
      .filter((model: any) => model.pricing?.prompt === 0 || model.id.includes(':free'))
      .map((model: any) => model.id);

    if (freeModels.length === 0) {
      throw new Error('No free models found.');
    }

    let response;
    let selectedModel = '';
    let attempt = 0;

    while (attempt < freeModels.length) {
      selectedModel = freeModels[Math.floor(Math.random() * freeModels.length)];
      try {
        response = await openai.chat.completions.create({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: `You are a helpful assistant for VirtuPath AI. Never give users tasks or lesson details directly. If they ask about specific tasks like "what are the tasks for acting today", politely explain that task management is handled by the official TaskBot, and they must enroll in a course to access it. The website offers: ${websiteContent}`
            },
            ...messages.filter((msg: Message) => msg.role !== 'system'),
          ],
          max_tokens: 1000,
        });
        break;
      } catch (err) {
        console.warn(`⚠️ Model ${selectedModel} failed. Trying another...`);
        attempt++;
      }
    }

    if (!response) {
      throw new Error('All model attempts failed.');
    }

    const reply = response.choices[0]?.message?.content || 'No response';
    return NextResponse.json({ reply });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json({ reply: 'Oops! Something went wrong.' }, { status: 500 });
  }
}
