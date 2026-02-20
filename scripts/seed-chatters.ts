/**
 * Seed initial chatters. Run: npx tsx scripts/seed-chatters.ts
 * Uses same JSON store as the app (relative to cwd when run from project root).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CHATTERS_FILE = path.join(DATA_DIR, "chatters.json");

interface Chatter {
  id: string;
  name: string;
  email?: string;
  preferredShifts: string[];
  preferredDaysOff: number[];
  sph: number;
  group: number;
  fillInOnly: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const now = new Date().toISOString();
const id = () => "c-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);

const chatters: Chatter[] = [
  {
    id: id(),
    name: "Adebayo",
    preferredShifts: ["swing"],
    preferredDaysOff: [0, 6],
    sph: 32,
    group: 1,
    fillInOnly: false,
    notes: "Chat lead",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: id(),
    name: "Sheila",
    preferredShifts: ["day"],
    preferredDaysOff: [6],
    sph: 28,
    group: 2,
    fillInOnly: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: id(),
    name: "Yorkshare",
    preferredShifts: ["swing"],
    preferredDaysOff: [3],
    sph: 27,
    group: 2,
    fillInOnly: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: id(),
    name: "Mary",
    preferredShifts: ["day"],
    preferredDaysOff: [3, 4],
    sph: 26,
    group: 2,
    fillInOnly: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: id(),
    name: "Mae",
    preferredShifts: ["night", "day", "swing"],
    preferredDaysOff: [2, 3],
    sph: 29,
    group: 2,
    fillInOnly: false,
    notes: "Flexible for all 3 shifts",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: id(),
    name: "Monah",
    preferredShifts: ["swing"],
    preferredDaysOff: [6],
    sph: 27,
    group: 2,
    fillInOnly: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: id(),
    name: "Jenny",
    preferredShifts: ["night"],
    sph: 30,
    preferredDaysOff: [],
    group: 1,
    fillInOnly: false,
    notes: "Only 12am-8am shift",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: id(),
    name: "Akans",
    preferredShifts: ["day"],
    preferredDaysOff: [0, 2, 5],
    sph: 25,
    group: 3,
    fillInOnly: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: id(),
    name: "Owen",
    preferredShifts: ["night", "swing"],
    preferredDaysOff: [],
    sph: 28,
    group: 2,
    fillInOnly: false,
    notes: "Overnights on Saturdays, otherwise 4pm-12am",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: id(),
    name: "Life",
    preferredShifts: ["night", "day", "swing"],
    preferredDaysOff: [],
    sph: 25,
    group: 2,
    fillInOnly: true,
    notes: "Fill in only when required",
    createdAt: now,
    updatedAt: now,
  },
];

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
const existing = existsSync(CHATTERS_FILE)
  ? JSON.parse(readFileSync(CHATTERS_FILE, "utf-8"))
  : [];
const combined = existing.length > 0 ? existing : chatters;
writeFileSync(CHATTERS_FILE, JSON.stringify(combined, null, 2), "utf-8");
console.log(
  existing.length > 0
    ? `Chatters file already has ${existing.length} entries; left unchanged.`
    : `Seeded ${chatters.length} chatters to ${CHATTERS_FILE}`
);
