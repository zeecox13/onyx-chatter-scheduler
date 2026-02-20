// Shift definitions (CST)
export type ShiftId = "night" | "day" | "swing";
// night = 12am-8am, day = 8am-4pm, swing = 4pm-12am

export type GroupId = 1 | 2 | 3; // 1=VIP, 2=Mid, 3=Pitching

export const SHIFT_LABELS: Record<ShiftId, string> = {
  night: "12am–8am CST",
  day: "8am–4pm CST",
  swing: "4pm–12am CST",
};

export const GROUP_LABELS: Record<GroupId, string> = {
  1: "VIP",
  2: "Mid",
  3: "Pitching",
};

export interface Chatter {
  id: string;
  name: string;
  email?: string;
  /** Preferred shift(s). Can be one or multiple for flexible chatters. */
  preferredShifts: ShiftId[];
  /** Days off (0=Sun, 1=Mon, ... 6=Sat) */
  preferredDaysOff: number[];
  /** Sales per hour – updated weekly. Affects hour allocation. */
  sph: number;
  /** Group assignment for day/swing (1=VIP, 2=Mid, 3=Pitching). Night shift uses best accounts, no group. */
  group: GroupId;
  /** If true, only schedule when required (fill-in). */
  fillInOnly: boolean;
  /** Special note, e.g. "Chat lead", "Overnights on Saturdays only" */
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleSlot {
  date: string; // YYYY-MM-DD
  shift: ShiftId;
  group?: GroupId; // only for day/swing
  chatterId: string;
}

export interface Schedule {
  id: string;
  /** e.g. "2025-03-01" to "2025-03-15" */
  startDate: string;
  endDate: string;
  slots: ScheduleSlot[];
  createdAt: string;
  updatedAt: string;
}

export type TimeOffStatus = "pending" | "approved" | "denied";

export interface TimeOffRequest {
  id: string;
  chatterId: string;
  chatterName: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: TimeOffStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
