import type { Chatter } from "./types";

/** Stable IDs so schedule generation and display stay consistent without persistence. */
const NOW = "2020-01-01T00:00:00.000Z";

export const DEFAULT_CHATTERS: Chatter[] = [
  { id: "c-adebayo", name: "Adebayo", preferredShifts: ["swing"], preferredDaysOff: [0, 6], sph: 32, group: 1, fillInOnly: false, notes: "Chat lead, 4pm–12am M–F", createdAt: NOW, updatedAt: NOW },
  { id: "c-sheila", name: "Sheila", preferredShifts: ["day"], preferredDaysOff: [6], sph: 28, group: 2, fillInOnly: false, notes: "Off Saturdays, only 8am–4pm", createdAt: NOW, updatedAt: NOW },
  { id: "c-yorkshare", name: "Yorkshare", preferredShifts: ["swing"], preferredDaysOff: [3], sph: 27, group: 2, fillInOnly: false, notes: "Off Wednesday, 4pm–12am", createdAt: NOW, updatedAt: NOW },
  { id: "c-mary", name: "Mary", preferredShifts: ["day"], preferredDaysOff: [3, 4], sph: 26, group: 2, fillInOnly: false, notes: "Off Wed/Thu, 8am–4pm", createdAt: NOW, updatedAt: NOW },
  { id: "c-mae", name: "Mae", preferredShifts: ["night", "day", "swing"], preferredDaysOff: [2, 3], sph: 29, group: 2, fillInOnly: false, notes: "Off Tue/Wed, flexible all 3 shifts", createdAt: NOW, updatedAt: NOW },
  { id: "c-monah", name: "Monah", preferredShifts: ["swing"], preferredDaysOff: [6], sph: 27, group: 2, fillInOnly: false, notes: "Off Saturday, only 4pm–12am", createdAt: NOW, updatedAt: NOW },
  { id: "c-jenny", name: "Jenny", preferredShifts: ["night"], preferredDaysOff: [], sph: 30, group: 1, fillInOnly: false, notes: "Only 12am–8am shift", createdAt: NOW, updatedAt: NOW },
  { id: "c-akans", name: "Akans", preferredShifts: ["day"], preferredDaysOff: [0, 2, 5], sph: 25, group: 3, fillInOnly: false, notes: "Off Sun/Tue/Fri, only 8am–4pm", createdAt: NOW, updatedAt: NOW },
  { id: "c-owen", name: "Owen", preferredShifts: ["night", "swing"], preferredDaysOff: [], sph: 28, group: 2, fillInOnly: false, notes: "Overnights on Saturdays, otherwise 4pm–12am", createdAt: NOW, updatedAt: NOW },
  { id: "c-life", name: "Life", preferredShifts: ["night", "day", "swing"], preferredDaysOff: [], sph: 25, group: 2, fillInOnly: true, notes: "Fill in only when required", createdAt: NOW, updatedAt: NOW },
];

export const DEFAULT_CHATTER_NAMES: Record<string, string> = Object.fromEntries(
  DEFAULT_CHATTERS.map((c) => [c.id, c.name])
);
