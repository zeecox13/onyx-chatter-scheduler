import { NextRequest, NextResponse } from "next/server";
import { getChatters, saveChatters } from "@/lib/store";
import type { Chatter, ShiftId, GroupId } from "@/lib/types";

function parseShifts(v: unknown): ShiftId[] {
  if (Array.isArray(v)) return v.filter((s) => ["night", "day", "swing"].includes(s)) as ShiftId[];
  if (typeof v === "string") return v.split(",").map((s) => s.trim()) as ShiftId[];
  return [];
}

function parseDaysOff(v: unknown): number[] {
  if (Array.isArray(v)) return v.map(Number).filter((n) => n >= 0 && n <= 6);
  if (typeof v === "string") return v.split(",").map(Number).filter((n) => n >= 0 && n <= 6);
  return [];
}

export async function GET() {
  const chatters = getChatters();
  return NextResponse.json(chatters);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const chatters = getChatters();
  const id = "c-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
  const now = new Date().toISOString();
  const chatter: Chatter = {
    id,
    name: String(body.name ?? "").trim() || "New Chatter",
    email: body.email ? String(body.email).trim() : undefined,
    preferredShifts: parseShifts(body.preferredShifts ?? ["day"]),
    preferredDaysOff: parseDaysOff(body.preferredDaysOff ?? []),
    sph: Number(body.sph) || 25,
    group: [1, 2, 3].includes(Number(body.group)) ? (Number(body.group) as GroupId) : 2,
    fillInOnly: Boolean(body.fillInOnly),
    notes: body.notes ? String(body.notes).trim() : undefined,
    createdAt: now,
    updatedAt: now,
  };
  chatters.push(chatter);
  saveChatters(chatters);
  return NextResponse.json(chatter);
}
