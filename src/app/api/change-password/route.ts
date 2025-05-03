// File: src/app/api/change-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import api from "@/lib/api";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 🔍 Parse and log request body
    const body = await req.json().catch(() => null);
    console.log("📩 Received body:", body);

    if (!body || !body.oldPassword || !body.newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { oldPassword, newPassword } = body;

    // 🔐 Forward cookies from the client request
    const cookie = req.headers.get("cookie");

    // ✅ Try fetching the user based on cookies/session
    const meRes = await api.get("/users/me", {
      headers: {
        Cookie: cookie || "",
      },
    });

    const user = meRes.data;
    if (!user || !user.passwordHash) {
      console.log("❌ Not authenticated or missing password hash.");
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // 🔐 Check if the old password is correct
    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) {
      console.log("❌ Incorrect old password.");
      return NextResponse.json({ error: "Your current password is incorrect!" }, { status: 403 });
    }

    // ✅ Enforce strong password rules
    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongRegex.test(newPassword)) {
      return NextResponse.json({
        error:
          "Password must be at least 8 characters, include an uppercase letter, a number, and a symbol.",
      }, { status: 400 });
    }

    // 🔑 Hash and update password
    const hashed = await bcrypt.hash(newPassword, 10);
    const updatedUser = {
      ...user,
      passwordHash: hashed,
    };

    await api.put(`/users/${user.userID}`, updatedUser, {
      headers: {
        Cookie: cookie || "",
      },
    });

    console.log("✅ Password changed successfully for:", user.email);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Change password error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
