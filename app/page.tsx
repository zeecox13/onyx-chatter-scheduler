"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getChatters as getChattersFromStore,
  getSchedules as getSchedulesFromStore,
  getTimeOffRequests,
} from "@/lib/local-store";

export default function Dashboard() {
  const [stats, setStats] = useState({
    chatters: 0,
    pendingTimeOff: 0,
    schedules: 0,
  });

  useEffect(() => {
    const chatters = getChattersFromStore();
    const timeOff = getTimeOffRequests();
    const schedules = getSchedulesFromStore();
    setStats({
      chatters: chatters.length,
      pendingTimeOff: timeOff.filter((t) => t.status === "pending").length,
      schedules: schedules.length,
    });
  }, []);

  const today = new Date();
  const day = today.getDate();
  const nextRun =
    day >= 20
      ? "1st–15th of next month (run after 20th)"
      : day >= 7
        ? "16th–end of month (run after 7th)"
        : "1st–15th of next month (run on or after 20th)";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-amber-400">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/chatters"
          className="rounded-xl border border-stone-700 bg-stone-800/50 p-6 transition hover:border-amber-500/50 hover:bg-stone-800"
        >
          <div className="text-3xl font-bold text-white">{stats.chatters}</div>
          <div className="text-stone-400">Chatters</div>
        </Link>
        <Link
          href="/schedule"
          className="rounded-xl border border-stone-700 bg-stone-800/50 p-6 transition hover:border-amber-500/50 hover:bg-stone-800"
        >
          <div className="text-3xl font-bold text-white">{stats.schedules}</div>
          <div className="text-stone-400">Schedule blocks</div>
        </Link>
        <Link
          href="/time-off"
          className="rounded-xl border border-stone-700 bg-stone-800/50 p-6 transition hover:border-amber-500/50 hover:bg-stone-800"
        >
          <div className="text-3xl font-bold text-white">{stats.pendingTimeOff}</div>
          <div className="text-stone-400">Pending time-off requests</div>
        </Link>
      </div>
      <div className="rounded-xl border border-stone-700 bg-stone-800/50 p-6">
        <h2 className="mb-2 font-semibold text-stone-200">Auto-schedule</h2>
        <p className="text-stone-400">
          Generate on the <strong className="text-stone-300">20th</strong> for{" "}
          <strong className="text-stone-300">1st–15th</strong> of the following month. Generate on the{" "}
          <strong className="text-stone-300">7th</strong> for{" "}
          <strong className="text-stone-300">16th–end of month</strong>.
        </p>
        <p className="mt-2 text-sm text-amber-400/90">Next suggested run: {nextRun}</p>
        <Link
          href="/schedule"
          className="mt-4 inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-amber-400"
        >
          Go to Schedule →
        </Link>
      </div>
    </div>
  );
}
