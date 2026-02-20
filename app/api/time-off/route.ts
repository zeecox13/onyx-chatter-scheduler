import { NextRequest, NextResponse } from "next/server";
import { getChatters, getTimeOffRequests, saveTimeOffRequests } from "@/lib/store";
import { sendTimeOffNotification } from "@/lib/email";

const NOTIFY_EMAIL = "zee@onyxspire.com";

export async function GET() {
  const requests = getTimeOffRequests();
  return NextResponse.json(requests);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { chatterId, startDate, endDate, reason } = body;
  if (!chatterId || !startDate || !endDate) {
    return NextResponse.json(
      { error: "chatterId, startDate, endDate required" },
      { status: 400 }
    );
  }
  const chatters = getChatters();
  const chatter = chatters.find((c) => c.id === chatterId);
  if (!chatter) {
    return NextResponse.json({ error: "Chatter not found" }, { status: 404 });
  }
  const id = "to-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
  const now = new Date().toISOString();
  const req = {
    id,
    chatterId,
    chatterName: chatter.name,
    startDate: String(startDate),
    endDate: String(endDate),
    reason: reason ? String(reason).trim() : undefined,
    status: "pending" as const,
    createdAt: now,
    updatedAt: now,
  };
  const requests = getTimeOffRequests();
  requests.push(req);
  saveTimeOffRequests(requests);

  await sendTimeOffNotification({
    chatterName: chatter.name,
    startDate: req.startDate,
    endDate: req.endDate,
    reason: req.reason,
    to: NOTIFY_EMAIL,
  });

  return NextResponse.json(req);
}
