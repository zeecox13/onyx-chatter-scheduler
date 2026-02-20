"use client";

import type { Chatter, Schedule, TimeOffRequest } from "./types";
import { DEFAULT_CHATTERS } from "./default-chatters";

const KEY_CHATTERS = "onyx:chatters";
const KEY_SCHEDULES = "onyx:schedules";
const KEY_TIMEOFF = "onyx:timeoff";

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function getChatters(): Chatter[] {
  const list = safeParse<Chatter[]>(KEY_CHATTERS, []);
  return list.length > 0 ? list : [...DEFAULT_CHATTERS];
}

export function saveChatters(chatters: Chatter[]) {
  safeSet(KEY_CHATTERS, chatters);
}

export function getSchedules(): Schedule[] {
  return safeParse<Schedule[]>(KEY_SCHEDULES, []);
}

export function saveSchedules(schedules: Schedule[]) {
  safeSet(KEY_SCHEDULES, schedules);
}

export function getTimeOffRequests(): TimeOffRequest[] {
  return safeParse<TimeOffRequest[]>(KEY_TIMEOFF, []);
}

export function saveTimeOffRequests(requests: TimeOffRequest[]) {
  safeSet(KEY_TIMEOFF, requests);
}
