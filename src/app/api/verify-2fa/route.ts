import { NextRequest, NextResponse } from "next/server";
import api from "@/lib/api";

interface TwoFARequest {
  email: string;
  code: string;
}

function normalize(val: string) {
  return val.replace(/[^\x20-\x7E]/g, "").trim(); // removes hidden/non-ASCII chars
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, code }: TwoFARequest = await req.json();

    if (!email || !code) {
      console.log("❌ Missing email or code");
      return NextResponse.json({ error: "Missing email or code" }, { status: 400 });
    }

    const res = await api.get("/users");
    const user = res.data.find((u: any) => u.email.trim().toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      console.log("❌ User not found:", email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isTwoFactorEnabled || !user.twoFactorCode || !user.twoFactorCodeExpiresAt) {
      console.log("❌ 2FA not properly set up for:", email);
      return NextResponse.json({ error: "2FA is not set up properly for this user" }, { status: 403 });
    }

    const sentCode = normalize(code);
    const dbCode = normalize(String(user.twoFactorCode));

    console.log("🔍 sentCode =", sentCode);
    console.log("🔍 dbCode   =", dbCode);

    if (sentCode !== dbCode) {
      console.log("❌ Code mismatch:", sentCode, "!=", dbCode);
      return NextResponse.json({ error: "Incorrect 2FA code" }, { status: 401 });
    }

    const now = new Date().toISOString();

    if (now > user.twoFactorCodeExpiresAt) {
     
      console.log("❌ Code expired at:", user.twoFactorCodeExpiresAt);
      return NextResponse.json({ error: "2FA code has expired" }, { status: 401 });
    }

    console.log("✅ 2FA verification successful for", email);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Verify 2FA error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
