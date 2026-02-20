import { NextRequest, NextResponse } from "next/server";
import { getChatters, saveChatters } from "@/lib/store";
import type { Chatter } from "@/lib/types";

/** Default team: Adebayo, Sheila, Yorkshare, Mary, Mae, Monah, Jenny, Akans, Owen, Life */
function buildDefaultChatters(now: string): Chatter[] {
  const id = () => "c-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
  return [
    { id: id(), name: "Adebayo", preferredShifts: ["swing"], preferredDaysOff: [0, 6], sph: 32, group: 1, fillInOnly: false, notes: "Chat lead, 4pm–12am M–F", createdAt: now, updatedAt: now },
    { id: id(), name: "Sheila", preferredShifts: ["day"], preferredDaysOff: [6], sph: 28, group: 2, fillInOnly: false, notes: "Off Saturdays, only 8am–4pm", createdAt: now, updatedAt: now },
    { id: id(), name: "Yorkshare", preferredShifts: ["swing"], preferredDaysOff: [3], sph: 27, group: 2, fillInOnly: false, notes: "Off Wednesday, 4pm–12am", createdAt: now, updatedAt: now },
    { id: id(), name: "Mary", preferredShifts: ["day"], preferredDaysOff: [3, 4], sph: 26, group: 2, fillInOnly: false, notes: "Off Wed/Thu, 8am–4pm", createdAt: now, updatedAt: now },
    { id: id(), name: "Mae", preferredShifts: ["night", "day", "swing"], preferredDaysOff: [2, 3], sph: 29, group: 2, fillInOnly: false, notes: "Off Tue/Wed, flexible all 3 shifts", createdAt: now, updatedAt: now },
    { id: id(), name: "Monah", preferredShifts: ["swing"], preferredDaysOff: [6], sph: 27, group: 2, fillInOnly: false, notes: "Off Saturday, only 4pm–12am", createdAt: now, updatedAt: now },
    { id: id(), name: "Jenny", preferredShifts: ["night"], preferredDaysOff: [], sph: 30, group: 1, fillInOnly: false, notes: "Only 12am–8am shift", createdAt: now, updatedAt: now },
    { id: id(), name: "Akans", preferredShifts: ["day"], preferredDaysOff: [0, 2, 5], sph: 25, group: 3, fillInOnly: false, notes: "Off Sun/Tue/Fri, only 8am–4pm", createdAt: now, updatedAt: now },
    { id: id(), name: "Owen", preferredShifts: ["night", "swing"], preferredDaysOff: [], sph: 28, group: 2, fillInOnly: false, notes: "Overnights on Saturdays, otherwise 4pm–12am", createdAt: now, updatedAt: now },
    { id: id(), name: "Life", preferredShifts: ["night", "day", "swing"], preferredDaysOff: [], sph: 25, group: 2, fillInOnly: true, notes: "Fill in only when required", createdAt: now, updatedAt: now },
  ];
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const replace = url.searchParams.get("replace") === "true";
  const existing = getChatters();
  const now = new Date().toISOString();
  const chatters = buildDefaultChatters(now);

  if (existing.length > 0 && !replace) {
    return NextResponse.json({
      message: "Chatters already exist. Use replace=true to load the default team over them.",
      count: existing.length,
    });
  }

  try {
    saveChatters(chatters);
    return NextResponse.json({
      message: replace ? "Replaced with default team (10 chatters)." : "Loaded default team (10 chatters).",
      count: chatters.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Save failed";
    return NextResponse.json(
      { error: msg, message: "Could not save (e.g. on Vercel data does not persist). Run the app locally for saving." },
      { status: 500 }
    );
  }
}
