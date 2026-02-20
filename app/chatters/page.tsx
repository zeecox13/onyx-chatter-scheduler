"use client";

import { useEffect, useState } from "react";
import type { Chatter as ChatterType, ShiftId, GroupId } from "@/lib/types";
import { SHIFT_LABELS, GROUP_LABELS } from "@/lib/types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ChattersPage() {
  const [chatters, setChatters] = useState<ChatterType[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ChatterType>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newChatter, setNewChatter] = useState({
    name: "",
    email: "",
    preferredShifts: ["day"] as ShiftId[],
    preferredDaysOff: [] as number[],
    sph: 25,
    group: 2 as GroupId,
    fillInOnly: false,
    notes: "",
  });

  const load = () => fetch("/api/chatters").then((r) => r.json()).then(setChatters);

  useEffect(() => {
    load();
  }, []);

  const startEdit = (c: ChatterType) => {
    setEditing(c.id);
    setForm({
      name: c.name,
      email: c.email,
      preferredShifts: c.preferredShifts,
      preferredDaysOff: c.preferredDaysOff,
      sph: c.sph,
      group: c.group,
      fillInOnly: c.fillInOnly,
      notes: c.notes,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    await fetch(`/api/chatters/${editing}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditing(null);
    load();
  };

  const addChatter = async () => {
    const res = await fetch("/api/chatters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newChatter),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || data.error || "Could not save chatter. On Vercel, data does not persist—use “Load default team” or run locally.");
      return;
    }
    setShowAdd(false);
    setNewChatter({
      name: "",
      email: "",
      preferredShifts: ["day"],
      preferredDaysOff: [],
      sph: 25,
      group: 2,
      fillInOnly: false,
      notes: "",
    });
    load();
  };

  const removeChatter = async (id: string) => {
    if (!confirm("Remove this chatter?")) return;
    await fetch(`/api/chatters/${id}`, { method: "DELETE" });
    load();
  };

  const loadDefaultTeam = async (replace: boolean) => {
    const res = await fetch(`/api/seed?replace=${replace}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) alert(data.message || data.error || "Failed to load team.");
    else alert(data.message || "Done.");
    load();
  };

  const toggleShift = (arr: ShiftId[], shift: ShiftId) => {
    if (arr.includes(shift)) return arr.filter((s) => s !== shift);
    return [...arr, shift];
  };
  const toggleDayOff = (arr: number[], day: number) => {
    if (arr.includes(day)) return arr.filter((d) => d !== day);
    return [...arr, day];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-400">Chatters</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadDefaultTeam(chatters.length > 0)}
            className="rounded-lg border border-amber-500/50 px-4 py-2 text-sm text-amber-400 hover:bg-amber-500/10"
          >
            {chatters.length > 0 ? "Load default team (replace)" : "Load default team"}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-amber-400"
          >
            Add chatter
          </button>
        </div>
      </div>
      <p className="text-sm text-stone-500">
        On Vercel, saving new chatters is not available. Use “Load default team” to restore the list. Schedule generation always uses the same default team. For lasting data, run locally (<code className="rounded bg-stone-700 px-1">npm run dev</code>).
      </p>

      {showAdd && (
        <div className="rounded-xl border border-stone-700 bg-stone-800/50 p-6">
          <h2 className="mb-4 font-semibold">New chatter</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-stone-400">Name</label>
              <input
                className="w-full rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white"
                value={newChatter.name}
                onChange={(e) => setNewChatter({ ...newChatter, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-stone-400">Email</label>
              <input
                type="email"
                className="w-full rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white"
                value={newChatter.email}
                onChange={(e) => setNewChatter({ ...newChatter, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-stone-400">SPH ($)</label>
              <input
                type="number"
                step={0.1}
                className="w-full rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white"
                value={newChatter.sph}
                onChange={(e) => setNewChatter({ ...newChatter, sph: Number(e.target.value) })}
              />
              <p className="mt-1 text-xs text-stone-500">Min $25, goal $30. Below $10 = fewer hours.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm text-stone-400">Group</label>
              <select
                className="w-full rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white"
                value={newChatter.group}
                onChange={(e) => setNewChatter({ ...newChatter, group: Number(e.target.value) as GroupId })}
              >
                {([1, 2, 3] as GroupId[]).map((g) => (
                  <option key={g} value={g}>{GROUP_LABELS[g]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-stone-400">Preferred shifts</label>
              <div className="flex flex-wrap gap-2">
                {(["night", "day", "swing"] as ShiftId[]).map((s) => (
                  <label key={s} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={newChatter.preferredShifts.includes(s)}
                      onChange={() =>
                        setNewChatter({
                          ...newChatter,
                          preferredShifts: toggleShift(newChatter.preferredShifts, s),
                        })
                      }
                    />
                    <span className="text-sm">{SHIFT_LABELS[s]}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-stone-400">Days off</label>
              <div className="flex flex-wrap gap-2">
                {DAY_NAMES.map((name, i) => (
                  <label key={i} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={newChatter.preferredDaysOff.includes(i)}
                      onChange={() =>
                        setNewChatter({
                          ...newChatter,
                          preferredDaysOff: toggleDayOff(newChatter.preferredDaysOff, i),
                        })
                      }
                    />
                    <span className="text-sm">{name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fillIn"
                checked={newChatter.fillInOnly}
                onChange={(e) => setNewChatter({ ...newChatter, fillInOnly: e.target.checked })}
              />
              <label htmlFor="fillIn" className="text-sm text-stone-400">Fill-in only when required</label>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-stone-400">Notes</label>
              <input
                className="w-full rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white"
                value={newChatter.notes}
                onChange={(e) => setNewChatter({ ...newChatter, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={addChatter}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-amber-400"
            >
              Save
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="rounded-lg border border-stone-600 px-4 py-2 text-sm hover:bg-stone-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-stone-700">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-700 bg-stone-800/80">
              <th className="p-3 font-medium text-stone-300">Name</th>
              <th className="p-3 font-medium text-stone-300">Shifts</th>
              <th className="p-3 font-medium text-stone-300">Days off</th>
              <th className="p-3 font-medium text-stone-300">SPH</th>
              <th className="p-3 font-medium text-stone-300">Group</th>
              <th className="p-3 font-medium text-stone-300">Fill-in</th>
              <th className="p-3 font-medium text-stone-300">Notes</th>
              <th className="p-3 font-medium text-stone-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chatters.map((c) => (
              <tr key={c.id} className="border-b border-stone-700/50 hover:bg-stone-800/30">
                {editing === c.id ? (
                  <>
                    <td className="p-3">
                      <input
                        className="w-32 rounded border border-stone-600 bg-stone-800 px-2 py-1 text-white"
                        value={form.name ?? ""}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {(["night", "day", "swing"] as ShiftId[]).map((s) => (
                          <label key={s} className="flex items-center gap-0.5">
                            <input
                              type="checkbox"
                              checked={(form.preferredShifts ?? []).includes(s)}
                              onChange={() =>
                                setForm({
                                  ...form,
                                  preferredShifts: toggleShift(form.preferredShifts ?? [], s),
                                })
                              }
                            />
                            <span className="text-xs">{SHIFT_LABELS[s].slice(0, 8)}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-0.5">
                        {DAY_NAMES.map((name, i) => (
                          <label key={i} className="flex items-center gap-0.5">
                            <input
                              type="checkbox"
                              checked={(form.preferredDaysOff ?? []).includes(i)}
                              onChange={() =>
                                setForm({
                                  ...form,
                                  preferredDaysOff: toggleDayOff(form.preferredDaysOff ?? [], i),
                                })
                              }
                            />
                            <span className="text-xs">{name[0]}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step={0.1}
                        className="w-16 rounded border border-stone-600 bg-stone-800 px-2 py-1 text-white"
                        value={form.sph ?? 0}
                        onChange={(e) => setForm({ ...form, sph: Number(e.target.value) })}
                      />
                    </td>
                    <td className="p-3">
                      <select
                        className="rounded border border-stone-600 bg-stone-800 px-2 py-1 text-white"
                        value={form.group ?? 2}
                        onChange={(e) => setForm({ ...form, group: Number(e.target.value) as GroupId })}
                      >
                        {([1, 2, 3] as GroupId[]).map((g) => (
                          <option key={g} value={g}>{GROUP_LABELS[g]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={form.fillInOnly ?? false}
                        onChange={(e) => setForm({ ...form, fillInOnly: e.target.checked })}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        className="min-w-[120px] rounded border border-stone-600 bg-stone-800 px-2 py-1 text-white"
                        value={form.notes ?? ""}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={saveEdit}
                        className="text-amber-400 hover:underline"
                      >
                        Save
                      </button>{" "}
                      <button
                        onClick={() => setEditing(null)}
                        className="text-stone-400 hover:underline"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3 font-medium text-white">{c.name}</td>
                    <td className="p-3 text-stone-400">
                      {c.preferredShifts.map((s) => SHIFT_LABELS[s]).join(", ")}
                    </td>
                    <td className="p-3 text-stone-400">
                      {c.preferredDaysOff.length
                        ? c.preferredDaysOff.map((d) => DAY_NAMES[d]).join(", ")
                        : "—"}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          c.sph >= 30
                            ? "text-emerald-400"
                            : c.sph < 25
                              ? "text-amber-500"
                              : "text-stone-300"
                        }
                      >
                        ${c.sph}
                      </span>
                    </td>
                    <td className="p-3 text-stone-400">{GROUP_LABELS[c.group]}</td>
                    <td className="p-3">{c.fillInOnly ? "Yes" : "—"}</td>
                    <td className="p-3 max-w-[140px] truncate text-stone-500">{c.notes || "—"}</td>
                    <td className="p-3">
                      <button
                        onClick={() => startEdit(c)}
                        className="text-amber-400 hover:underline"
                      >
                        Edit
                      </button>{" "}
                      <button
                        onClick={() => removeChatter(c.id)}
                        className="text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
