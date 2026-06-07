import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-6 py-16 font-[family-name:var(--font-geist-sans)]">
      <main className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-orange-600">
          Property Management System
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          HostOps
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          Manage bookings, guests, and operations for hotels, hostels, dorms,
          and guesthouses across India — all in one place.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700"
          >
            Owner Login
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
