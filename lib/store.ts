import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import type { Chatter, Schedule, TimeOffRequest } from "./types";
import { isKvConfigured, kvGet, kvSet } from "./kv";

const DATA_DIR = path.join(process.cwd(), "data");
const CHATTERS_FILE = path.join(DATA_DIR, "chatters.json");
const SCHEDULES_FILE = path.join(DATA_DIR, "schedules.json");
const TIMEOFF_FILE = path.join(DATA_DIR, "timeoff.json");

const KV_KEY_CHATTERS = "onyx:chatters";
const KV_KEY_SCHEDULES = "onyx:schedules";
const KV_KEY_TIMEOFF = "onyx:timeoff";

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonFile<T>(file: string, defaultVal: T): T {
  ensureDir();
  if (!existsSync(file)) return defaultVal;
  try {
    const raw = readFileSync(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal;
  }
}

function writeJsonFile<T>(file: string, data: T) {
  ensureDir();
  writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

async function readJson<T>(key: string, file: string, defaultVal: T): Promise<T> {
  if (isKvConfigured()) {
    try {
      const raw = await kvGet(key);
      if (raw == null) return defaultVal;
      return JSON.parse(raw) as T;
    } catch {
      return defaultVal;
    }
  }
  return readJsonFile(file, defaultVal);
}

async function writeJson<T>(key: string, file: string, data: T): Promise<void> {
  if (isKvConfigured()) {
    await kvSet(key, JSON.stringify(data));
    return;
  }
  writeJsonFile(file, data);
}

// Chatters
export async function getChatters(): Promise<Chatter[]> {
  return readJson<Chatter[]>(KV_KEY_CHATTERS, CHATTERS_FILE, []);
}

export async function saveChatters(chatters: Chatter[]): Promise<void> {
  await writeJson(KV_KEY_CHATTERS, CHATTERS_FILE, chatters);
}

// Schedules
export async function getSchedules(): Promise<Schedule[]> {
  return readJson<Schedule[]>(KV_KEY_SCHEDULES, SCHEDULES_FILE, []);
}

export async function saveSchedules(schedules: Schedule[]): Promise<void> {
  await writeJson(KV_KEY_SCHEDULES, SCHEDULES_FILE, schedules);
}

// Time-off requests
export async function getTimeOffRequests(): Promise<TimeOffRequest[]> {
  return readJson<TimeOffRequest[]>(KV_KEY_TIMEOFF, TIMEOFF_FILE, []);
}

export async function saveTimeOffRequests(requests: TimeOffRequest[]): Promise<void> {
  await writeJson(KV_KEY_TIMEOFF, TIMEOFF_FILE, requests);
}
