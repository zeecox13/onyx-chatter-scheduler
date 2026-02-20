import { NextRequest, NextResponse } from "next/server";

const NOTIFY_EMAIL = "zee@onyxspire.com";

/** Send time-off notification email. Body: chatterName, startDate, endDate, reason. No storage. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { chatterName, startDate, endDate, reason } = body;
  if (!chatterName || !startDate || !endDate) {
    return NextResponse.json(
      { error: "chatterName, startDate, endDate required" },
      { status: 400 }
    );
  }
  const { sendTimeOffNotification } = await import("@/lib/email");
  const result = await sendTimeOffNotification({
    chatterName: String(chatterName),
    startDate: String(startDate),
    endDate: String(endDate),
    reason: reason ? String(reason).trim() : undefined,
    to: NOTIFY_EMAIL,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
