import { NextRequest, NextResponse } from "next/server";
import api from "@/lib/api"; // 👈 already configured with your backend URL

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const payload = await req.json();

    const backendRes = await api.post("/users/verify-2fa", payload, {
      withCredentials: true, // ✅ ensures cookies are handled
    });

    // ✅ Pass cookies to client from backend
    const setCookie = backendRes.headers["set-cookie"];
    const response = NextResponse.json(backendRes.data, { status: backendRes.status });

    if (setCookie) {
      response.headers.set("set-cookie", Array.isArray(setCookie) ? setCookie.join(",") : setCookie);
    }

    return response;
  } catch (err: any) {
    const message = err?.response?.data?.error || "2FA verification failed";
    const status = err?.response?.status || 500;
    return NextResponse.json({ error: message }, { status });
  }
}
