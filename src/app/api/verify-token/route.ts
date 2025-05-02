import { NextRequest } from "next/server";

declare global {
  var resetTokens: Map<string, { email: string; expiresAt: number }>;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) return Response.json({ error: "Missing token" }, { status: 400 });

  globalThis.resetTokens = globalThis.resetTokens || new Map();
  const entry = globalThis.resetTokens.get(token);

  if (!entry || entry.expiresAt < Date.now()) {
    return Response.json({ error: "Token expired or invalid" }, { status: 400 });
  }

  return Response.json({ email: entry.email });
}
