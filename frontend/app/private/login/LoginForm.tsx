"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export function LoginForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("Volle");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        setPassword("");
        router.push(redirectTo);
        router.refresh();
        return;
      }

      if (response.status === 503) {
        setMessage("Der private Zugang ist serverseitig noch nicht vollständig konfiguriert.");
      } else if (response.status === 429) {
        setMessage("Zu viele Loginversuche. Bitte versuche es später erneut.");
      } else {
        setMessage("Benutzername oder Passwort ist ungültig.");
      }

      setStatus("error");
    } catch {
      setMessage("Das Backend ist nicht erreichbar.");
      setStatus("error");
    }
  };

  return (
    <form className="border border-white/12 bg-white/[0.045] p-6" onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <label className="block text-sm font-semibold text-white/80" htmlFor="username">
          Benutzername
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
            className="mt-3 w-full border border-white/12 bg-black/35 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-suit-green/70"
          />
        </label>

        <label className="block text-sm font-semibold text-white/80" htmlFor="password">
          Passwort
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="mt-3 w-full border border-white/12 bg-black/35 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-suit-green/70"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 w-full bg-suit-purple px-5 py-3 text-sm font-bold text-white transition hover:bg-suit-purple/85 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Prüfe Zugriff..." : "Einloggen"}
      </button>

      {message ? (
        <p className="mt-4 border border-suit-orange/40 bg-suit-orange/10 px-4 py-3 text-sm leading-6 text-suit-orange">
          {message}
        </p>
      ) : null}
    </form>
  );
}
