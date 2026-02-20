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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chatters = getChatters();
  const c = chatters.find((x) => x.id === id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(c);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const chatters = getChatters();
  const idx = chatters.findIndex((x) => x.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const prev = chatters[idx];
  const updated: Chatter = {
    ...prev,
    name: body.name !== undefined ? String(body.name).trim() : prev.name,
    email: body.email !== undefined ? (body.email ? String(body.email).trim() : undefined) : prev.email,
    preferredShifts: body.preferredShifts !== undefined ? parseShifts(body.preferredShifts) : prev.preferredShifts,
    preferredDaysOff: body.preferredDaysOff !== undefined ? parseDaysOff(body.preferredDaysOff) : prev.preferredDaysOff,
    sph: body.sph !== undefined ? Number(body.sph) : prev.sph,
    group: body.group !== undefined && [1, 2, 3].includes(Number(body.group)) ? (Number(body.group) as GroupId) : prev.group,
    fillInOnly: body.fillInOnly !== undefined ? Boolean(body.fillInOnly) : prev.fillInOnly,
    notes: body.notes !== undefined ? (body.notes ? String(body.notes).trim() : undefined) : prev.notes,
    updatedAt: new Date().toISOString(),
  };
  chatters[idx] = updated;
  saveChatters(chatters);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chatters = getChatters().filter((x) => x.id !== id);
  saveChatters(chatters);
  return NextResponse.json({ ok: true });
}
