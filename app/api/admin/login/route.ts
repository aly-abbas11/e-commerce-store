import { NextResponse } from "next/server";

import { adminCookieOptions, getAdminSecret } from "@/lib/admin";
import { ADMIN_COOKIE } from "@/lib/db/publish";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = body?.password ? String(body.password) : "";
  const secret = getAdminSecret();

  if (!password || password !== secret) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, token: secret });
  res.cookies.set(ADMIN_COOKIE, secret, adminCookieOptions());
  return res;
}
