import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_PASSWORD =
  process.env.ADMIN_TOKEN ||
  process.env.REVALIDATION_TOKEN ||
  "voltgear-demo-revalidate";

/**
 * Admin UI login. Verifies the password (ADMIN_TOKEN) and returns the token
 * so the browser can attach it as `Authorization: Bearer …` to admin API
 * calls. In production, swap this for proper OAuth/session management.
 *
 *   POST /api/admin/login  { "password": "…" }  → { "token": "…" }
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = body?.password ? String(body.password) : "";

  if (!password || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  return NextResponse.json({ ok: true, token: ADMIN_PASSWORD });
}
