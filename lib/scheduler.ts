import {
  addDays,
  format,
  parseISO,
  isAfter,
  isWithinInterval,
  getDay,
} from "date-fns";
import type { Chatter, ScheduleSlot, ShiftId, GroupId, TimeOffRequest } from "./types";

/** SPH weight: below 10 = minimal, below 25 = less, 25–30 = normal, 30+ = more */
function sphWeight(sph: number): number {
  if (sph < 10) return 0.2;
  if (sph < 25) return 0.6;
  if (sph >= 30) return 1.25;
  return 1;
}

function canWorkShift(c: Chatter, shift: ShiftId): boolean {
  return c.preferredShifts.includes(shift);
}

function canWorkDay(c: Chatter, dayOfWeek: number): boolean {
  return !c.preferredDaysOff.includes(dayOfWeek);
}

/** Day of week 0=Sun, 1=Mon, ... 6=Sat */
function isOff(c: Chatter, date: Date): boolean {
  return c.preferredDaysOff.includes(getDay(date));
}

/** Get chatters who are on approved time off for this date */
function getTimeOffChatterIds(requests: TimeOffRequest[], date: string): Set<string> {
  const approved = requests.filter(
    (r) => r.status === "approved" && r.startDate && r.endDate
  );
  const d = parseISO(date);
  const ids = new Set<string>();
  for (const r of approved) {
    const start = parseISO(r.startDate);
    const end = parseISO(r.endDate);
    if (isWithinInterval(d, { start, end })) ids.add(r.chatterId);
  }
  return ids;
}

/** Build list of (chatter, weight) for a shift+group, sorted by weight desc; exclude off and time-off. */
function candidates(
  chatters: Chatter[],
  timeOffRequests: TimeOffRequest[],
  date: Date,
  shift: ShiftId,
  group: GroupId | null,
  excludeIds: Set<string>,
  existingSlotChatterIds: Set<string>
): Array<{ chatter: Chatter; weight: number }> {
  const dayOfWeek = getDay(date);
  const dateStr = format(date, "yyyy-MM-dd");
  const onTimeOff = getTimeOffChatterIds(timeOffRequests, dateStr);

  const list: Array<{ chatter: Chatter; weight: number }> = [];
  for (const c of chatters) {
    if (excludeIds.has(c.id) || onTimeOff.has(c.id) || existingSlotChatterIds.has(c.id)) continue;
    if (c.fillInOnly) continue; // only use fill-in when we have no one else
    if (!canWorkShift(c, shift)) continue;
    if (!canWorkDay(c, dayOfWeek)) continue;
    if (shift !== "night" && c.group !== group) continue;
    const w = sphWeight(c.sph);
    list.push({ chatter: c, weight: w });
  }
  list.sort((a, b) => b.weight - a.weight);
  return list;
}

/** For night shift we don't care about group; for day/swing we need one per group. */
export function generateSchedule(
  chatters: Chatter[],
  timeOffRequests: TimeOffRequest[],
  startDate: string,
  endDate: string
): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  let d = start;
  while (!isAfter(d, end)) {
    const dateStr = format(d, "yyyy-MM-dd");
    const dayOfWeek = getDay(d);
    const usedThisDay = new Set<string>();

    // Night: 1 person (any group; we use best accounts)
    const nightCands = candidates(
      chatters,
      timeOffRequests,
      d,
      "night",
      null,
      new Set(),
      usedThisDay
    );
    if (nightCands.length > 0) {
      const pick = nightCands[0].chatter;
      slots.push({ date: dateStr, shift: "night", chatterId: pick.id });
      usedThisDay.add(pick.id);
    } else {
      // Try fill-in only
      const fillIn = chatters.filter(
        (c) =>
          c.fillInOnly &&
          canWorkShift(c, "night") &&
          canWorkDay(c, dayOfWeek) &&
          !getTimeOffChatterIds(timeOffRequests, dateStr).has(c.id)
      );
      if (fillIn.length > 0) {
        slots.push({
          date: dateStr,
          shift: "night",
          chatterId: fillIn[0].id,
        });
        usedThisDay.add(fillIn[0].id);
      }
    }

    // Day: 3 people (groups 1, 2, 3)
    for (const g of [1, 2, 3] as GroupId[]) {
      const dayCands = candidates(
        chatters,
        timeOffRequests,
        d,
        "day",
        g,
        new Set(),
        usedThisDay
      );
      if (dayCands.length > 0) {
        const pick = dayCands[0].chatter;
        slots.push({
          date: dateStr,
          shift: "day",
          group: g,
          chatterId: pick.id,
        });
        usedThisDay.add(pick.id);
      } else {
        const fillIn = chatters.filter(
          (c) =>
            (c.fillInOnly || c.group === g) &&
            canWorkShift(c, "day") &&
            canWorkDay(c, dayOfWeek) &&
            !getTimeOffChatterIds(timeOffRequests, dateStr).has(c.id) &&
            !usedThisDay.has(c.id)
        );
        if (fillIn.length > 0) {
          slots.push({
            date: dateStr,
            shift: "day",
            group: g,
            chatterId: fillIn[0].id,
          });
          usedThisDay.add(fillIn[0].id);
        }
      }
    }

    // Swing: 3 people (groups 1, 2, 3)
    for (const g of [1, 2, 3] as GroupId[]) {
      const swingCands = candidates(
        chatters,
        timeOffRequests,
        d,
        "swing",
        g,
        new Set(),
        usedThisDay
      );
      if (swingCands.length > 0) {
        const pick = swingCands[0].chatter;
        slots.push({
          date: dateStr,
          shift: "swing",
          group: g,
          chatterId: pick.id,
        });
        usedThisDay.add(pick.id);
      } else {
        const fillIn = chatters.filter(
          (c) =>
            (c.fillInOnly || c.group === g) &&
            canWorkShift(c, "swing") &&
            canWorkDay(c, dayOfWeek) &&
            !getTimeOffChatterIds(timeOffRequests, dateStr).has(c.id) &&
            !usedThisDay.has(c.id)
        );
        if (fillIn.length > 0) {
          slots.push({
            date: dateStr,
            shift: "swing",
            group: g,
            chatterId: fillIn[0].id,
          });
          usedThisDay.add(fillIn[0].id);
        }
      }
    }

    d = addDays(d, 1);
  }
  return slots;
}

/** Find a replacement for a slot (e.g. after time off approval). Same rules, exclude current assignee. */
export function findReplacement(
  chatters: Chatter[],
  timeOffRequests: TimeOffRequest[],
  slot: ScheduleSlot,
  excludeChatterId: string
): Chatter | null {
  const date = parseISO(slot.date);
  const dayOfWeek = getDay(date);
  const usedThisDay = new Set<string>([excludeChatterId]);
  const group = slot.shift === "night" ? null : (slot.group ?? 1);
  const cands = candidates(
    chatters,
    timeOffRequests,
    date,
    slot.shift,
    group,
    new Set(),
    usedThisDay
  );
  if (cands.length > 0) return cands[0].chatter;
  const fillIn = chatters.filter(
    (c) =>
      c.fillInOnly &&
      canWorkShift(c, slot.shift) &&
      canWorkDay(c, dayOfWeek) &&
      !getTimeOffChatterIds(timeOffRequests, slot.date).has(c.id)
  );
  return fillIn.length > 0 ? fillIn[0] : null;
}
