import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Store as a simple log — in production, wire to Mailchimp/Resend lists
    console.log(`[newsletter] New subscriber: ${email}`);

    return NextResponse.json({
      ok: true,
      message: "Request received — we'll be in touch.",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
