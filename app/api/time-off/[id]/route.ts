import { NextRequest, NextResponse } from "next/server";
import {
  getChatters,
  getSchedules,
  getTimeOffRequests,
  saveTimeOffRequests,
  saveSchedules,
} from "@/lib/store";
import { findReplacement } from "@/lib/scheduler";
import { isWithinInterval, parseISO } from "date-fns";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body;
  if (status !== "approved" && status !== "denied") {
    return NextResponse.json(
      { error: "status must be approved or denied" },
      { status: 400 }
    );
  }
  const requests = await getTimeOffRequests();
  const idx = requests.findIndex((r) => r.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const req = requests[idx];
  if (req.status !== "pending") {
    return NextResponse.json(
      { error: "Request already reviewed" },
      { status: 400 }
    );
  }
  const now = new Date().toISOString();
  requests[idx] = {
    ...req,
    status,
    updatedAt: now,
    reviewedAt: now,
    reviewedBy: "admin",
  };
  await saveTimeOffRequests(requests);

  if (status === "approved") {
    const [chatters, schedules] = await Promise.all([getChatters(), getSchedules()]);
    const timeOffRequests = await getTimeOffRequests();
    const start = parseISO(req.startDate);
    const end = parseISO(req.endDate);
    let changed = false;
    for (const schedule of schedules) {
      for (let i = 0; i < schedule.slots.length; i++) {
        const slot = schedule.slots[i];
        if (slot.chatterId !== req.chatterId) continue;
        const d = parseISO(slot.date);
        if (!isWithinInterval(d, { start, end })) continue;
        const replacement = findReplacement(chatters, timeOffRequests, slot, req.chatterId);
        if (replacement) {
          schedule.slots[i] = { ...slot, chatterId: replacement.id };
          changed = true;
        }
      }
      if (changed) schedule.updatedAt = now;
    }
    if (changed) await saveSchedules(schedules);
  }

  return NextResponse.json(requests[idx]);
}
