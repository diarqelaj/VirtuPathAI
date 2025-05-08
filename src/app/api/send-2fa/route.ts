import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { TwoFAEmail } from "@/components/email-templates/TwoFAEmail";
import api from "@/lib/api";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // 1. ✅ Get user from your backend
    const res = await api.get("/users");
    const user = res.data.find((u: any) => u.email === email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!user.isTwoFactorEnabled) {
      return NextResponse.json({ error: "2FA is not enabled for this user" }, { status: 403 });
    }

    // 2. ✅ Generate code and expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // ✅ 10 minutes from now, UTC ISO

    

    // 3. ✅ Save code via PATCH endpoint
    await api.patch("/Users/2fa", {
      email,
      code,
      expiresAt,
    });

    // 4. ✅ Send code via Resend
    const emailContent = TwoFAEmail({ code });
    const { error } = await resend.emails.send({
      from: "VirtuPath AI <virtupathai@gmail.com>",
      to: [email],
      subject: "Your 2FA Code - VirtuPath AI",
      react: emailContent as React.ReactElement,
    });

    if (error) {
      console.error("📧 Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ 2FA code sent to", email);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ send-2fa error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
