import { NextRequest, NextResponse } from "next/server";
import { getChatters, getSchedules, saveSchedules } from "@/lib/store";
import { generateSchedule } from "@/lib/scheduler";
import { addMonths, startOfMonth, endOfMonth, setDate, format } from "date-fns";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const schedules = getSchedules();
  if (start && end) {
    const inRange = schedules.filter(
      (s) => (s.startDate >= start && s.startDate <= end) || (s.endDate >= start && s.endDate <= end)
    );
    return NextResponse.json(inRange);
  }
  return NextResponse.json(schedules);
}

/** Generate schedule: on 20th → 1st–15th next month; on 7th → 16th–end of month. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const today = new Date();
  const day = today.getDate();
  let startDate: string;
  let endDate: string;
  if (body.startDate && body.endDate) {
    startDate = body.startDate;
    endDate = body.endDate;
  } else if (day >= 20) {
    const next = addMonths(today, 1);
    startDate = format(startOfMonth(next), "yyyy-MM-dd");
    endDate = format(setDate(next, 15), "yyyy-MM-dd");
  } else if (day >= 7) {
    const thisMonth = today;
    startDate = format(setDate(thisMonth, 16), "yyyy-MM-dd");
    endDate = format(endOfMonth(thisMonth), "yyyy-MM-dd");
  } else {
    const next = addMonths(today, 1);
    startDate = format(startOfMonth(next), "yyyy-MM-dd");
    endDate = format(setDate(next, 15), "yyyy-MM-dd");
  }
  const chatters = getChatters();
  const slots = generateSchedule(chatters, startDate, endDate);
  const id = "s-" + Date.now();
  const now = new Date().toISOString();
  const schedule = {
    id,
    startDate,
    endDate,
    slots,
    createdAt: now,
    updatedAt: now,
  };
  const schedules = getSchedules().filter(
    (s) => !(s.startDate === startDate && s.endDate === endDate)
  );
  schedules.push(schedule);
  saveSchedules(schedules);
  return NextResponse.json(schedule);
}
