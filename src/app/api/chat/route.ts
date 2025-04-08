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

    const response = await openai.chat.completions.create({
      model: 'openrouter/quasar-alpha',

      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant for ViruPath AI. Never give users tasks or lesson details directly. If they ask about specific tasks like "what are the tasks for acting today", politely explain that task management is handled by the official TaskBot, and they must enroll in a course to access it. The website offers: ${websiteContent}`
        },
        ...messages.filter((msg: Message) => msg.role !== 'system'),
      ],
      max_tokens: 1000, // ✅ Avoid 402 errors by staying under credit limits
    });

    const reply = response.choices[0]?.message?.content || 'No response';
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json({ reply: 'Oops! Something went wrong.' }, { status: 500 });
  }
}
