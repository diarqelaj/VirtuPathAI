import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate fetching website content (replace with actual logic)
    const websiteContent = 'We at ViruPath Ai offer AI-powered career training, including chatbots, analytics, and automation tools.';

    return NextResponse.json({ content: websiteContent });
  } catch (error) {
    console.error('❌ Website content API error:', error);
    return NextResponse.json({ content: 'Failed to fetch website content.' }, { status: 500 });
  }
}
