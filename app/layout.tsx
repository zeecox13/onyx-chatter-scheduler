import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Onyx Chatter Scheduler",
  description: "Schedule and time-off for the chat team",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-stone-950 text-stone-100">
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-stone-700 bg-stone-900/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold text-amber-400">
              Onyx Chatter Scheduler
            </Link>
            <nav className="flex gap-6">
              <Link
                href="/"
                className="text-stone-300 hover:text-white transition"
              >
                Dashboard
              </Link>
              <Link
                href="/chatters"
                className="text-stone-300 hover:text-white transition"
              >
                Chatters
              </Link>
              <Link
                href="/schedule"
                className="text-stone-300 hover:text-white transition"
              >
                Schedule
              </Link>
              <Link
                href="/time-off"
                className="text-stone-300 hover:text-white transition"
              >
                Time Off
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
