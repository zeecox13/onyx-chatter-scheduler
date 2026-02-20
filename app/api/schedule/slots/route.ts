import { NextRequest, NextResponse } from "next/server";
import { getSchedules, saveSchedules } from "@/lib/store";
import type { ScheduleSlot } from "@/lib/types";

/** PATCH: update one or more slots (e.g. change chatter for a slot). */
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { scheduleId, slotIndex, chatterId } = body;
  if (!scheduleId || slotIndex == null) {
    return NextResponse.json(
      { error: "scheduleId and slotIndex required" },
      { status: 400 }
    );
  }
  const schedules = getSchedules();
  const s = schedules.find((x) => x.id === scheduleId);
  if (!s) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  const idx = Number(slotIndex);
  if (idx < 0 || idx >= s.slots.length) {
    return NextResponse.json({ error: "Invalid slot index" }, { status: 400 });
  }
  if (chatterId !== undefined) s.slots[idx].chatterId = String(chatterId);
  s.updatedAt = new Date().toISOString();
  saveSchedules(schedules);
  return NextResponse.json(s.slots[idx]);
}
