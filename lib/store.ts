import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import type { Chatter, Schedule, TimeOffRequest } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const CHATTERS_FILE = path.join(DATA_DIR, "chatters.json");
const SCHEDULES_FILE = path.join(DATA_DIR, "schedules.json");
const TIMEOFF_FILE = path.join(DATA_DIR, "timeoff.json");

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(file: string, defaultVal: T): T {
  ensureDir();
  if (!existsSync(file)) return defaultVal;
  try {
    const raw = readFileSync(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal;
  }
}

function writeJson<T>(file: string, data: T) {
  ensureDir();
  writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

// Chatters
export function getChatters(): Chatter[] {
  return readJson<Chatter[]>(CHATTERS_FILE, []);
}

export function saveChatters(chatters: Chatter[]) {
  writeJson(CHATTERS_FILE, chatters);
}

// Schedules (we store multiple schedule blocks)
export function getSchedules(): Schedule[] {
  return readJson<Schedule[]>(SCHEDULES_FILE, []);
}

export function saveSchedules(schedules: Schedule[]) {
  writeJson(SCHEDULES_FILE, schedules);
}

// Time-off requests
export function getTimeOffRequests(): TimeOffRequest[] {
  return readJson<TimeOffRequest[]>(TIMEOFF_FILE, []);
}

export function saveTimeOffRequests(requests: TimeOffRequest[]) {
  writeJson(TIMEOFF_FILE, requests);
}
