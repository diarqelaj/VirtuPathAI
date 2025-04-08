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
          content: `You are a helpful assistant for VirtuPath AI. Here is some context about the website: ${websiteContent}`,
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
