import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai'; // ✅ This uses your existing setup for OpenRouter API

// Define the message type
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: Message[] = body.messages;

    // Extract the system message and dynamically update it with website content
    const systemMessage = messages.find((msg: Message) => msg.role === 'system');
    const websiteContent = systemMessage?.content || '';

    // Use Deepseek R1 via OpenRouter for the model
    const response = await openai.chat.completions.create({
      model: 'deepseek/deepseek-r1', // Update to Deepseek R1 model from OpenRouter
      messages: [
        { 
          role: 'system', 
          content: `You are a helpful assistant. Here is some context about the website: ${websiteContent}` 
        },
        ...messages.filter((msg: Message) => msg.role !== 'system'),
      ],
    });

    const reply = response.choices[0]?.message?.content || 'No response';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json({ reply: 'Oops! Something went wrong.' }, { status: 500 });
  }
}
