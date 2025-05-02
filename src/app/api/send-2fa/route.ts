import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { TwoFAEmail } from '@/components/email-templates/TwoFAEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, code } = body;

  if (!email || !code) {
    return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: 'security@virtupath.ai',
    to: email,
    subject: 'Your 2FA Code for VirtuPath AI',
    react: TwoFAEmail({ code }),
  });

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
