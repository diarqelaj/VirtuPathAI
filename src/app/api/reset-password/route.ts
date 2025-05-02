import { NextRequest } from "next/server";
import api from "@/lib/api"; // axios instance for your ASP.NET API
import bcrypt from "bcryptjs";

declare global {
  var resetTokens: Map<string, { email: string; expiresAt: number }>;
}

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword)
      return Response.json({ error: "Missing token or password" }, { status: 400 });

    globalThis.resetTokens = globalThis.resetTokens || new Map();
    const entry = globalThis.resetTokens.get(token);

    if (!entry || entry.expiresAt < Date.now()) {
      return Response.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const userEmail = entry.email;

    // ✅ Step 1: Fetch all users to find the one to update
    const usersRes = await api.get("/users"); // lowercase route
    const user = usersRes.data.find((u: any) => u.email === userEmail);

    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    // ✅ Step 2: Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Step 3: Send PUT request to update password
    const updatedUser = {
      ...user,
      passwordHash: hashedPassword,
    };

    await api.put(`/users/${user.userID}`, updatedUser);

    // ✅ Step 4: Clean up token
    globalThis.resetTokens.delete(token);

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("❌ Reset password error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
