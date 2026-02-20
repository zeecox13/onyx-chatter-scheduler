"use client";

import { useEffect, useState } from "react";
import { format, parseISO, addMonths, startOfMonth, endOfMonth, setDate } from "date-fns";
import type { Schedule as ScheduleType, ScheduleSlot } from "@/lib/types";
import type { Chatter } from "@/lib/types";
import { SHIFT_LABELS, GROUP_LABELS } from "@/lib/types";
import { DEFAULT_CHATTER_NAMES } from "@/lib/default-chatters";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [chatters, setChatters] = useState<Chatter[]>([]);
  const [generating, setGenerating] = useState(false);
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [editingSlot, setEditingSlot] = useState<{ scheduleId: string; slotIndex: number; slot: ScheduleSlot } | null>(null);

  const load = () => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then(setSchedules);
    fetch("/api/chatters")
      .then((r) => r.json())
      .then(setChatters);
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async (useCustom?: boolean) => {
    setGenerating(true);
    try {
      const body =
        useCustom && customRange.start && customRange.end
          ? { startDate: customRange.start, endDate: customRange.end }
          : {};
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.id) setSchedules((prev) => [...prev.filter((s) => s.id !== data.id), data]);
      load();
    } finally {
      setGenerating(false);
    }
  };

  const today = new Date();
  const day = today.getDate();
  const suggestFirstHalf = day >= 20;
  const suggestSecondHalf = day >= 7 && day < 20;
  const nextStart = suggestFirstHalf
    ? format(startOfMonth(addMonths(today, 1)), "yyyy-MM-dd")
    : format(setDate(addMonths(today, 1), 1), "yyyy-MM-dd");
  const nextEndFirst = format(setDate(addMonths(today, 1), 15), "yyyy-MM-dd");
  const nextEndSecond = format(endOfMonth(today), "yyyy-MM-dd");

  const updateSlot = async (newChatterId: string) => {
    if (!editingSlot) return;
    await fetch("/api/schedule/slots", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduleId: editingSlot.scheduleId,
        slotIndex: editingSlot.slotIndex,
        chatterId: newChatterId,
      }),
    });
    setEditingSlot(null);
    load();
  };

  const chatterName = (id: string) => chatters.find((c) => c.id === id)?.name ?? DEFAULT_CHATTER_NAMES[id] ?? id;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-amber-400">Schedule</h1>

      <div className="rounded-xl border border-stone-700 bg-stone-800/50 p-6">
        <h2 className="mb-4 font-semibold text-stone-200">Generate schedule</h2>
        <p className="mb-2 text-sm text-stone-400">
          On the <strong>20th</strong>: generate for 1st–15th of the following month. On the{" "}
          <strong>7th</strong>: generate for 16th–end of current month.
        </p>
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm text-stone-400">Custom start</label>
            <input
              type="date"
              className="rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white"
              value={customRange.start}
              onChange={(e) => setCustomRange((r) => ({ ...r, start: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-stone-400">Custom end</label>
            <input
              type="date"
              className="rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white"
              value={customRange.end}
              onChange={(e) => setCustomRange((r) => ({ ...r, end: e.target.value }))}
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
            {generating ? "Generating…" : "Auto-generate (suggested range)"}
          </button>
        </div>
        {suggestFirstHalf && (
          <p className="text-sm text-amber-400/90">
            Suggested: 1st–15th next month ({nextStart} – {nextEndFirst})
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
              {editingSlot.slot.group != null && ` · ${GROUP_LABELS[editingSlot.slot.group]}`}
            </p>
            <select
              className="mb-4 w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-white"
              defaultValue={editingSlot.slot.chatterId}
              onChange={(e) => updateSlot(e.target.value)}
            >
              {chatters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
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

      <div className="space-y-6">
        {schedules.map((s) => {
          const byDate = s.slots.reduce(
            (acc, slot) => {
              if (!acc[slot.date]) acc[slot.date] = [];
              acc[slot.date].push(slot);
              return acc;
            },
            {} as Record<string, ScheduleSlot[]>
          );
          const dates = Object.keys(byDate).sort();
          return (
            <div key={s.id} className="rounded-xl border border-stone-700 bg-stone-800/30 overflow-hidden">
              <div className="border-b border-stone-700 bg-stone-800/80 px-4 py-3 font-semibold text-stone-200">
                {s.startDate} – {s.endDate}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-700 bg-stone-800/50">
                      <th className="p-2 font-medium text-stone-400">Date</th>
                      <th className="p-2 font-medium text-stone-400">12am–8am</th>
                      <th className="p-2 font-medium text-stone-400">8am–4pm (VIP)</th>
                      <th className="p-2 font-medium text-stone-400">8am–4pm (Mid)</th>
                      <th className="p-2 font-medium text-stone-400">8am–4pm (Pitch)</th>
                      <th className="p-2 font-medium text-stone-400">4pm–12am (VIP)</th>
                      <th className="p-2 font-medium text-stone-400">4pm–12am (Mid)</th>
                      <th className="p-2 font-medium text-stone-400">4pm–12am (Pitch)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dates.map((date) => {
                      const slots = byDate[date];
                      const night = slots.find((x) => x.shift === "night");
                      const day1 = slots.find((x) => x.shift === "day" && x.group === 1);
                      const day2 = slots.find((x) => x.shift === "day" && x.group === 2);
                      const day3 = slots.find((x) => x.shift === "day" && x.group === 3);
                      const swing1 = slots.find((x) => x.shift === "swing" && x.group === 1);
                      const swing2 = slots.find((x) => x.shift === "swing" && x.group === 2);
                      const swing3 = slots.find((x) => x.shift === "swing" && x.group === 3);
                      const getIdx = (slot: ScheduleSlot | undefined) =>
                        slot
                          ? s.slots.findIndex(
                              (x) =>
                                x.date === slot.date &&
                                x.shift === slot.shift &&
                                (x.group ?? 0) === (slot.group ?? 0) &&
                                x.chatterId === slot.chatterId
                            )
                          : -1;
                      return (
                        <tr key={date} className="border-b border-stone-700/50 hover:bg-stone-800/20">
                          <td className="p-2 font-medium text-stone-300">
                            {format(parseISO(date), "EEE M/d")}
                          </td>
                          <td className="p-2">
                            <SlotCell
                              slot={night}
                              name={night ? chatterName(night.chatterId) : "—"}
                              onEdit={() => night && setEditingSlot({ scheduleId: s.id, slotIndex: getIdx(night), slot: night })}
                            />
                          </td>
                          <td className="p-2">
                            <SlotCell
                              slot={day1}
                              name={day1 ? chatterName(day1.chatterId) : "—"}
                              onEdit={() => day1 && setEditingSlot({ scheduleId: s.id, slotIndex: getIdx(day1), slot: day1 })}
                            />
                          </td>
                          <td className="p-2">
                            <SlotCell
                              slot={day2}
                              name={day2 ? chatterName(day2.chatterId) : "—"}
                              onEdit={() => day2 && setEditingSlot({ scheduleId: s.id, slotIndex: getIdx(day2), slot: day2 })}
                            />
                          </td>
                          <td className="p-2">
                            <SlotCell
                              slot={day3}
                              name={day3 ? chatterName(day3.chatterId) : "—"}
                              onEdit={() => day3 && setEditingSlot({ scheduleId: s.id, slotIndex: getIdx(day3), slot: day3 })}
                            />
                          </td>
                          <td className="p-2">
                            <SlotCell
                              slot={swing1}
                              name={swing1 ? chatterName(swing1.chatterId) : "—"}
                              onEdit={() => swing1 && setEditingSlot({ scheduleId: s.id, slotIndex: getIdx(swing1), slot: swing1 })}
                            />
                          </td>
                          <td className="p-2">
                            <SlotCell
                              slot={swing2}
                              name={swing2 ? chatterName(swing2.chatterId) : "—"}
                              onEdit={() => swing2 && setEditingSlot({ scheduleId: s.id, slotIndex: getIdx(swing2), slot: swing2 })}
                            />
                          </td>
                          <td className="p-2">
                            <SlotCell
                              slot={swing3}
                              name={swing3 ? chatterName(swing3.chatterId) : "—"}
                              onEdit={() => swing3 && setEditingSlot({ scheduleId: s.id, slotIndex: getIdx(swing3), slot: swing3 })}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {schedules.length === 0 && (
        <p className="text-stone-500">No schedules yet. Generate one above.</p>
      )}
    </div>
  );
}

function SlotCell({
  slot,
  name,
  onEdit,
}: {
  slot: ScheduleSlot | undefined;
  name: string;
  onEdit: () => void;
}) {
  if (!slot) return <span className="text-stone-500">—</span>;
  return (
    <span className="flex items-center gap-1">
      <span>{name}</span>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs text-amber-400 hover:underline"
      >
        Edit
      </button>
    </span>
  );
}
