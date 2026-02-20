import { NextResponse } from "next/server";
import { getChatters, saveChatters } from "@/lib/store";
import type { Chatter } from "@/lib/types";

export async function POST() {
  const existing = getChatters();
  if (existing.length > 0) {
    return NextResponse.json({
      message: "Chatters already exist; not seeding.",
      count: existing.length,
    });
  }
  const now = new Date().toISOString();
  const id = () => "c-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);

  const chatters: Chatter[] = [
    { id: id(), name: "Adebayo", preferredShifts: ["swing"], preferredDaysOff: [0, 6], sph: 32, group: 1, fillInOnly: false, notes: "Chat lead", createdAt: now, updatedAt: now },
    { id: id(), name: "Sheila", preferredShifts: ["day"], preferredDaysOff: [6], sph: 28, group: 2, fillInOnly: false, createdAt: now, updatedAt: now },
    { id: id(), name: "Yorkshare", preferredShifts: ["swing"], preferredDaysOff: [3], sph: 27, group: 2, fillInOnly: false, createdAt: now, updatedAt: now },
    { id: id(), name: "Mary", preferredShifts: ["day"], preferredDaysOff: [3, 4], sph: 26, group: 2, fillInOnly: false, createdAt: now, updatedAt: now },
    { id: id(), name: "Mae", preferredShifts: ["night", "day", "swing"], preferredDaysOff: [2, 3], sph: 29, group: 2, fillInOnly: false, notes: "Flexible for all 3 shifts", createdAt: now, updatedAt: now },
    { id: id(), name: "Monah", preferredShifts: ["swing"], preferredDaysOff: [6], sph: 27, group: 2, fillInOnly: false, createdAt: now, updatedAt: now },
    { id: id(), name: "Jenny", preferredShifts: ["night"], preferredDaysOff: [], sph: 30, group: 1, fillInOnly: false, notes: "Only 12am-8am shift", createdAt: now, updatedAt: now },
    { id: id(), name: "Akans", preferredShifts: ["day"], preferredDaysOff: [0, 2, 5], sph: 25, group: 3, fillInOnly: false, createdAt: now, updatedAt: now },
    { id: id(), name: "Owen", preferredShifts: ["night", "swing"], preferredDaysOff: [], sph: 28, group: 2, fillInOnly: false, notes: "Overnights on Saturdays, otherwise 4pm-12am", createdAt: now, updatedAt: now },
    { id: id(), name: "Life", preferredShifts: ["night", "day", "swing"], preferredDaysOff: [], sph: 25, group: 2, fillInOnly: true, notes: "Fill in only when required", createdAt: now, updatedAt: now },
  ];
  saveChatters(chatters);
  return NextResponse.json({ message: "Seeded 10 chatters.", count: chatters.length });
}
