import { NextRequest, NextResponse } from "next/server";

/**
 * Login proxy: browser sends credentials to same-origin only.
 * This server forwards to the backend. Never log request body (contains password).
 * How ERPs typically handle it: HTTPS + same-origin auth endpoint + server-side backend call.
 */
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_REG_ID =
  process.env.NEXT_PUBLIC_DEFAULT_REGISTRATION_ID ?? "";

export async function POST(request: NextRequest) {
  if (!BACKEND_API_URL) {
    return NextResponse.json(
      { message: "API URL not configured", result: 0 },
      { status: 500 }
    );
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body", result: 0 },
      { status: 400 }
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Reg-Id": DEFAULT_REG_ID,
  };

  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers,
      body,
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[Auth Login] Backend request failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { message: "Login service unavailable", result: 0 },
      { status: 502 }
    );
  }
}
