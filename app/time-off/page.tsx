"use client";

import { useEffect, useState } from "react";
import type { TimeOffRequest } from "@/lib/types";
import type { Chatter } from "@/lib/types";

export default function TimeOffPage() {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [chatters, setChatters] = useState<Chatter[]>([]);
  const [form, setForm] = useState({
    chatterId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    fetch("/api/time-off")
      .then((r) => r.json())
      .then(setRequests);
    fetch("/api/chatters")
      .then((r) => r.json())
      .then(setChatters);
  };

  useEffect(() => {
    load();
  }, []);

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.chatterId || !form.startDate || !form.endDate) return;
    setSubmitting(true);
    try {
      await fetch("/api/time-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ chatterId: "", startDate: "", endDate: "", reason: "" });
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const review = async (id: string, status: "approved" | "denied") => {
    await fetch(`/api/time-off/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-amber-400">Time off</h1>

      <div className="rounded-xl border border-stone-700 bg-stone-800/50 p-6">
        <h2 className="mb-4 font-semibold text-stone-200">Request time off</h2>
        <p className="mb-4 text-sm text-stone-400">
          Submitting sends an email to zee@onyxspire.com. You can approve or deny in the list below; approving will auto-find a replacement on the schedule.
        </p>
        <form onSubmit={submitRequest} className="flex flex-wrap gap-4">
          <div>
            <label className="mb-1 block text-sm text-stone-400">Employee</label>
            <select
              required
              className="rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white min-w-[180px]"
              value={form.chatterId}
              onChange={(e) => setForm({ ...form, chatterId: e.target.value })}
            >
              <option value="">Select…</option>
              {chatters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-stone-400">Start date</label>
            <input
              type="date"
              required
              className="rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-stone-400">End date</label>
            <input
              type="date"
              required
              className="rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-stone-400">Reason (optional)</label>
            <input
              type="text"
              className="rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white"
              placeholder="Vacation, sick, etc."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-amber-400 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-stone-700 bg-stone-800/50 overflow-hidden">
        <div className="border-b border-stone-700 bg-stone-800/80 px-4 py-3 font-semibold text-stone-200">
          All requests
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-700 bg-stone-800/50">
                <th className="p-3 font-medium text-stone-400">Employee</th>
                <th className="p-3 font-medium text-stone-400">Start</th>
                <th className="p-3 font-medium text-stone-400">End</th>
                <th className="p-3 font-medium text-stone-400">Reason</th>
                <th className="p-3 font-medium text-stone-400">Status</th>
                <th className="p-3 font-medium text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-stone-700/50 hover:bg-stone-800/30">
                  <td className="p-3 font-medium text-white">{r.chatterName}</td>
                  <td className="p-3 text-stone-400">{r.startDate}</td>
                  <td className="p-3 text-stone-400">{r.endDate}</td>
                  <td className="p-3 text-stone-500">{r.reason || "—"}</td>
                  <td className="p-3">
                    <span
                      className={
                        r.status === "pending"
                          ? "text-amber-400"
                          : r.status === "approved"
                            ? "text-emerald-400"
                            : "text-red-400"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => review(r.id, "approved")}
                          className="mr-2 text-emerald-400 hover:underline"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => review(r.id, "denied")}
                          className="text-red-400 hover:underline"
                        >
                          Deny
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {requests.length === 0 && (
          <p className="p-6 text-stone-500">No time-off requests yet.</p>
        )}
      </div>
    </div>
  );
}
