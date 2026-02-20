"use client";

import { useEffect, useState, useMemo } from "react";
import {
  format,
  parseISO,
  addMonths,
  addDays,
  startOfMonth,
  endOfMonth,
  setDate,
  getDay,
  isSameMonth,
  isBefore,
} from "date-fns";
import type { Schedule as ScheduleType, ScheduleSlot } from "@/lib/types";
import type { Chatter } from "@/lib/types";
import { SHIFT_LABELS, GROUP_LABELS } from "@/lib/types";
import { DEFAULT_CHATTER_NAMES } from "@/lib/default-chatters";
import { generateSchedule } from "@/lib/scheduler";
import {
  getChatters as getChattersFromStore,
  getSchedules as getSchedulesFromStore,
  getTimeOffRequests,
  saveSchedules,
} from "@/lib/local-store";

const CHATTER_COLORS = [
  "bg-emerald-600/80 text-white",
  "bg-sky-600/80 text-white",
  "bg-amber-600/80 text-white",
  "bg-violet-600/80 text-white",
  "bg-rose-500/80 text-white",
  "bg-lime-600/80 text-white",
  "bg-orange-500/80 text-white",
  "bg-teal-600/80 text-white",
  "bg-fuchsia-600/80 text-white",
  "bg-amber-700/90 text-white",
  "bg-indigo-500/80 text-white",
  "bg-pink-500/80 text-white",
];

function getChatterColor(chatterId: string, chatterIds: string[]): string {
  const idx = chatterIds.indexOf(chatterId);
  if (idx === -1) return "bg-stone-600/60 text-stone-300";
  return CHATTER_COLORS[idx % CHATTER_COLORS.length];
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [chatters, setChatters] = useState<Chatter[]>([]);
  const [generating, setGenerating] = useState(false);
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [calendarMonth, setCalendarMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [editingSlot, setEditingSlot] = useState<{
    scheduleId: string;
    slotIndex: number;
    slot: ScheduleSlot;
  } | null>(null);

  const load = () => {
    setSchedules(getSchedulesFromStore());
    setChatters(getChattersFromStore());
  };

  useEffect(() => {
    load();
  }, []);

  const chatterName = (id: string) =>
    chatters.find((c) => c.id === id)?.name ?? DEFAULT_CHATTER_NAMES[id] ?? id;

  const chatterIdsForColor = useMemo(() => {
    const ids = new Set<string>();
    schedules.forEach((s) => s.slots.forEach((slot) => ids.add(slot.chatterId)));
    chatters.forEach((c) => ids.add(c.id));
    return Array.from(ids).sort();
  }, [schedules, chatters]);

  const getDateRange = (useCustom: boolean) => {
    if (useCustom && customRange.start && customRange.end) {
      return { startDate: customRange.start, endDate: customRange.end };
    }
    const today = new Date();
    const day = today.getDate();
    if (day >= 20) {
      const next = addMonths(today, 1);
      return {
        startDate: format(startOfMonth(next), "yyyy-MM-dd"),
        endDate: format(setDate(next, 15), "yyyy-MM-dd"),
      };
    }
    if (day >= 7) {
      const thisMonth = today;
      return {
        startDate: format(setDate(thisMonth, 16), "yyyy-MM-dd"),
        endDate: format(endOfMonth(thisMonth), "yyyy-MM-dd"),
      };
    }
    const next = addMonths(today, 1);
    return {
      startDate: format(startOfMonth(next), "yyyy-MM-dd"),
      endDate: format(setDate(next, 15), "yyyy-MM-dd"),
    };
  };

  const generate = (useCustom?: boolean) => {
    setGenerating(true);
    const { startDate, endDate } = getDateRange(!!useCustom);
    const chattersList = getChattersFromStore();
    const timeOff = getTimeOffRequests();
    const slots = generateSchedule(chattersList, timeOff, startDate, endDate);
    const now = new Date().toISOString();
    const schedule: ScheduleType = {
      id: "s-" + Date.now(),
      startDate,
      endDate,
      slots,
      createdAt: now,
      updatedAt: now,
    };
    const existing = getSchedulesFromStore();
    const next = existing.filter(
      (s) => !(s.startDate === startDate && s.endDate === endDate)
    );
    next.push(schedule);
    setSchedules(next);
    saveSchedules(next);
    setCalendarMonth(format(parseISO(startDate), "yyyy-MM"));
    setGenerating(false);
  };

  const today = new Date();
  const day = today.getDate();
  const suggestFirstHalf = day >= 20;
  const suggestSecondHalf = day >= 7 && day < 20;

  const updateSlot = (newChatterId: string) => {
    if (!editingSlot) return;
    const next = schedules.map((s) => {
      if (s.id !== editingSlot.scheduleId) return s;
      const slots = [...s.slots];
      if (slots[editingSlot.slotIndex]) {
        slots[editingSlot.slotIndex] = {
          ...slots[editingSlot.slotIndex],
          chatterId: newChatterId,
        };
      }
      return { ...s, slots, updatedAt: new Date().toISOString() };
    });
    setSchedules(next);
    saveSchedules(next);
    setEditingSlot(null);
  };

  const monthStart = startOfMonth(parseISO(calendarMonth + "-01"));
  const monthEnd = endOfMonth(monthStart);
  const calendarWeeks = useMemo(() => {
    const weeks: Date[][] = [];
    let d = addDays(monthStart, -getDay(monthStart));
    while (isBefore(d, monthEnd) || weeks.length < 5) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(d);
        d = addDays(d, 1);
      }
      weeks.push(week);
      if (weeks.length >= 6) break;
    }
    return weeks;
  }, [calendarMonth]);

  const slotsByDateAndSchedule = useMemo(() => {
    const byDate: Record<
      string,
      Array<{ slot: ScheduleSlot; scheduleId: string; slotIndex: number }>
    > = {};
    schedules.forEach((s) => {
      s.slots.forEach((slot, idx) => {
        if (!byDate[slot.date]) byDate[slot.date] = [];
        const key = `${slot.shift}-${slot.group ?? "n"}`;
        const has = byDate[slot.date].some(
          (e) => e.slot.shift === slot.shift && (e.slot.group ?? 0) === (slot.group ?? 0)
        );
        if (!has) byDate[slot.date].push({ slot, scheduleId: s.id, slotIndex: idx });
      });
    });
    return byDate;
  }, [schedules]);

  const getSlotInfo = (dateStr: string, shift: "night" | "day" | "swing", group?: 1 | 2 | 3) => {
    const list = slotsByDateAndSchedule[dateStr];
    if (!list) return null;
    const entry = list.find(
      (e) => e.slot.shift === shift && (e.slot.group ?? 0) === (group ?? 0)
    );
    return entry ? { slot: entry.slot, scheduleId: entry.scheduleId, slotIndex: entry.slotIndex } : null;
  };

  const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-amber-400">Schedule</h1>

      <div className="rounded-xl border border-stone-700 bg-stone-800/50 p-6">
        <h2 className="mb-4 font-semibold text-stone-200">Generate schedule</h2>
        <p className="mb-2 text-sm text-stone-400">
          On the <strong>20th</strong>: 1st–15th next month. On the{" "}
          <strong>7th</strong>: 16th–end of month.
        </p>
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm text-stone-400">Custom start</label>
            <input
              type="date"
              className="rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white"
              value={customRange.start}
              onChange={(e) =>
                setCustomRange((r) => ({ ...r, start: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-stone-400">Custom end</label>
            <input
              type="date"
              className="rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white"
              value={customRange.end}
              onChange={(e) =>
                setCustomRange((r) => ({ ...r, end: e.target.value }))
              }
            />
          </div>
          <button
            onClick={() => generate(true)}
            disabled={generating || !customRange.start || !customRange.end}
            className="rounded-lg border border-stone-600 px-4 py-2 text-sm hover:bg-stone-700 disabled:opacity-50"
          >
            Generate custom range
          </button>
          <button
            onClick={() => generate(false)}
            disabled={generating}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-amber-400 disabled:opacity-50"
          >
            {generating ? "Generating…" : "Auto-generate"}
          </button>
        </div>
        {suggestFirstHalf && (
          <p className="text-sm text-amber-400/90">
            Suggested: 1st–15th next month
          </p>
        )}
        {suggestSecondHalf && (
          <p className="text-sm text-amber-400/90">
            Suggested: 16th–end of month (use custom range)
          </p>
        )}
      </div>

      {editingSlot && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-stone-600 bg-stone-800 p-6">
            <h3 className="mb-2 font-semibold">Replace on this slot</h3>
            <p className="mb-4 text-sm text-stone-400">
              {editingSlot.slot.date} · {SHIFT_LABELS[editingSlot.slot.shift]}
              {editingSlot.slot.group != null &&
                ` · ${GROUP_LABELS[editingSlot.slot.group]}`}
            </p>
            <select
              className="mb-4 w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-white"
              defaultValue={editingSlot.slot.chatterId}
              onChange={(e) => updateSlot(e.target.value)}
            >
              {chatters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setEditingSlot(null)}
              className="rounded border border-stone-600 px-4 py-2 text-sm hover:bg-stone-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-stone-700 bg-stone-800/30 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-700 bg-stone-800/80 px-4 py-3">
          <h2 className="font-semibold text-stone-200">
            {format(monthStart, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setCalendarMonth(
                  format(addMonths(parseISO(calendarMonth + "-01"), -1), "yyyy-MM")
                )
              }
              className="rounded border border-stone-600 px-3 py-1 text-sm hover:bg-stone-700"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() =>
                setCalendarMonth(
                  format(addMonths(parseISO(calendarMonth + "-01"), 1), "yyyy-MM")
                )
              }
              className="rounded border border-stone-600 px-3 py-1 text-sm hover:bg-stone-700"
            >
              Next →
            </button>
          </div>
        </div>
        <div className="overflow-x-auto p-2">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {WEEKDAY_NAMES.map((name) => (
                  <th
                    key={name}
                    className="border border-stone-600 bg-stone-800/80 p-1 text-center font-medium text-stone-400"
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarWeeks.map((week, wi) => (
                <tr key={wi}>
                  {week.map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const inMonth = isSameMonth(date, monthStart);
                    const night = getSlotInfo(dateStr, "night");
                    const day1 = getSlotInfo(dateStr, "day", 1);
                    const day2 = getSlotInfo(dateStr, "day", 2);
                    const day3 = getSlotInfo(dateStr, "day", 3);
                    const swing1 = getSlotInfo(dateStr, "swing", 1);
                    const swing2 = getSlotInfo(dateStr, "swing", 2);
                    const swing3 = getSlotInfo(dateStr, "swing", 3);
                    return (
                      <td
                        key={dateStr}
                        className={`min-w-[120px] max-w-[160px] border border-stone-600 align-top ${
                          inMonth ? "bg-stone-800/40" : "bg-stone-900/60"
                        }`}
                      >
                        <div className="p-1">
                          <div
                            className={`mb-1 text-center font-medium ${
                              inMonth ? "text-stone-200" : "text-stone-500"
                            }`}
                          >
                            {format(date, "M/d")}
                          </div>
                          <div className="space-y-0.5">
                            <div className="grid grid-cols-3 gap-0.5">
                              <DayCell
                                info={night}
                                chatterName={chatterName}
                                colorClass={night ? getChatterColor(night.slot.chatterId, chatterIdsForColor) : ""}
                                onEdit={() =>
                                  night &&
                                  setEditingSlot({
                                    scheduleId: night.scheduleId,
                                    slotIndex: night.slotIndex,
                                    slot: night.slot,
                                  })
                                }
                                label="12a-8a"
                              />
                              <DayCell
                                info={null}
                                colorClass="opacity-0"
                                onEdit={() => {}}
                                label=""
                              />
                              <DayCell
                                info={null}
                                colorClass="opacity-0"
                                onEdit={() => {}}
                                label=""
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-0.5">
                              <DayCell
                                info={day1}
                                chatterName={chatterName}
                                colorClass={day1 ? getChatterColor(day1.slot.chatterId, chatterIdsForColor) : ""}
                                onEdit={() =>
                                  day1 &&
                                  setEditingSlot({
                                    scheduleId: day1.scheduleId,
                                    slotIndex: day1.slotIndex,
                                    slot: day1.slot,
                                  })
                                }
                                label=""
                              />
                              <DayCell
                                info={day2}
                                chatterName={chatterName}
                                colorClass={day2 ? getChatterColor(day2.slot.chatterId, chatterIdsForColor) : ""}
                                onEdit={() =>
                                  day2 &&
                                  setEditingSlot({
                                    scheduleId: day2.scheduleId,
                                    slotIndex: day2.slotIndex,
                                    slot: day2.slot,
                                  })
                                }
                                label=""
                              />
                              <DayCell
                                info={day3}
                                chatterName={chatterName}
                                colorClass={day3 ? getChatterColor(day3.slot.chatterId, chatterIdsForColor) : ""}
                                onEdit={() =>
                                  day3 &&
                                  setEditingSlot({
                                    scheduleId: day3.scheduleId,
                                    slotIndex: day3.slotIndex,
                                    slot: day3.slot,
                                  })
                                }
                                label=""
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-0.5">
                              <DayCell
                                info={swing1}
                                chatterName={chatterName}
                                colorClass={swing1 ? getChatterColor(swing1.slot.chatterId, chatterIdsForColor) : ""}
                                onEdit={() =>
                                  swing1 &&
                                  setEditingSlot({
                                    scheduleId: swing1.scheduleId,
                                    slotIndex: swing1.slotIndex,
                                    slot: swing1.slot,
                                  })
                                }
                                label=""
                              />
                              <DayCell
                                info={swing2}
                                chatterName={chatterName}
                                colorClass={swing2 ? getChatterColor(swing2.slot.chatterId, chatterIdsForColor) : ""}
                                onEdit={() =>
                                  swing2 &&
                                  setEditingSlot({
                                    scheduleId: swing2.scheduleId,
                                    slotIndex: swing2.slotIndex,
                                    slot: swing2.slot,
                                  })
                                }
                                label=""
                              />
                              <DayCell
                                info={swing3}
                                chatterName={chatterName}
                                colorClass={swing3 ? getChatterColor(swing3.slot.chatterId, chatterIdsForColor) : ""}
                                onEdit={() =>
                                  swing3 &&
                                  setEditingSlot({
                                    scheduleId: swing3.scheduleId,
                                    slotIndex: swing3.slotIndex,
                                    slot: swing3.slot,
                                  })
                                }
                                label=""
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-stone-700 bg-stone-800/80 px-4 py-3">
          <p className="mb-2 text-xs text-stone-500">
            Rows: 12am–8am (1) · 8am–4pm G1/G2/G3 · 4pm–12am G1/G2/G3. Click a name to edit.
          </p>
          <div className="flex flex-wrap gap-2">
            {chatterIdsForColor.map((id) => (
              <span
                key={id}
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${getChatterColor(id, chatterIdsForColor)}`}
              >
                {chatterName(id)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {schedules.length === 0 && (
        <p className="text-stone-500">No schedules yet. Generate one above.</p>
      )}
    </div>
  );
}

function DayCell({
  info,
  chatterName: chatterNameFn,
  colorClass,
  onEdit,
  label,
}: {
  info: { slot: ScheduleSlot; scheduleId: string; slotIndex: number } | null;
  chatterName?: (id: string) => string;
  colorClass: string;
  onEdit: () => void;
  label: string;
}) {
  if (!info) {
    return (
      <div
        className={`rounded px-1 py-0.5 text-center text-[10px] ${label ? "text-stone-500" : ""}`}
        title={label}
      >
        {label || "—"}
      </div>
    );
  }
  const name = chatterNameFn ? chatterNameFn(info.slot.chatterId) : info.slot.chatterId;
  return (
    <button
      type="button"
      onClick={onEdit}
      className={`rounded px-1 py-0.5 text-center text-[10px] font-medium transition hover:ring-1 hover:ring-amber-400 ${colorClass}`}
      title={`${name} (click to edit)`}
    >
      {name.length > 8 ? name.slice(0, 7) + "…" : name}
    </button>
  );
}
