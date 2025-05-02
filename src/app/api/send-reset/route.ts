import { NextRequest } from "next/server";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";
import { ResetPasswordEmail } from "@/components/email-templates/ResetPasswordEmail";
import api from "@/lib/api";

const resend = new Resend(process.env.RESEND_API_KEY);

declare global {
  var resetTokens: Map<string, { email: string; expiresAt: number }>;
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    console.log("📩 Email received:", email);

    if (!email) {
      console.log("❌ No email provided");
      return Response.json({ error: "Missing email" }, { status: 400 });
    }

    const res = await api.get("/users");
    console.log("📦 Users fetched:", res.data.length);

    const user = res.data.find((u: any) => u.email === email);
    if (!user) {
      console.log("❌ User not found:", email);
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const token = uuidv4();
    const expiresAt = Date.now() + 15 * 60 * 1000;
    globalThis.resetTokens = globalThis.resetTokens || new Map();
    globalThis.resetTokens.set(token, { email, expiresAt });

    const resetLink = `https://localhost:3000/reset-password?token=${token}`;
    console.log("🔗 Reset link:", resetLink);

    const emailContent = ResetPasswordEmail({ resetLink });
    console.log("✅ Email template generated");

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "Reset Your Password - VirtuPath AI",
      react: emailContent as React.ReactElement,
    });

    if (error) {
      console.error("📧 Resend error:", error);
      return Response.json({ error: error.message || "Failed to send email" }, { status: 500 });
    }

    console.log("✅ Email sent!");
    return Response.json({ success: true, data });
  } catch (error: any) {
    console.error("❗ FULL ERROR:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "Unknown server error",
        stack: error?.stack || "",
        name: error?.name || "",
        ...(error?.response?.data && { apiResponse: error.response.data }) // for Axios errors
      }),
      { status: 500 }
    );
  }
  
}
