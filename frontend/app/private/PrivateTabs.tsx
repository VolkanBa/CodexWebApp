"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const tabs = [
  {
    href: "/private",
    label: "Übersicht"
  },
  {
    href: "/private/games",
    label: "Spiele"
  }
];

export function PrivateTabs() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include"
    });

    router.push("/");
    router.refresh();
  };

  return (
    <nav className="mb-8 flex flex-col gap-4 border border-white/10 bg-white/[0.04] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="grid grid-cols-2 gap-2 sm:flex">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-3 text-center text-sm font-bold transition ${
                isActive
                  ? "bg-suit-purple text-white"
                  : "border border-white/10 bg-suit-black/40 text-white/70 hover:border-suit-green/50 hover:text-white"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="bg-suit-orange px-4 py-3 text-sm font-bold text-suit-black transition hover:bg-orange-400"
      >
        Logout
      </button>
    </nav>
  );
}
