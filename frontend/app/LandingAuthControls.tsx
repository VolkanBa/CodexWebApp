"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type LandingAuthControlsProps = {
  variant: "nav" | "hero";
};

export function LandingAuthControls({ variant }: LandingAuthControlsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/auth/me`, {
          credentials: "include"
        });

        if (isMounted) {
          setStatus(response.ok ? "authenticated" : "unauthenticated");
        }
      } catch {
        if (isMounted) {
          setStatus("unauthenticated");
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setStatus("loading");

    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include"
    });

    setStatus("unauthenticated");
    router.refresh();
  };

  if (variant === "hero") {
    if (status !== "unauthenticated") {
      return null;
    }

    return (
      <Link
        href="/login"
        className="inline-flex items-center justify-center border border-white/20 bg-white/8 px-5 py-3 text-sm font-bold text-white transition hover:border-suit-green/70 hover:bg-suit-green/10"
      >
        Anmeldung
      </Link>
    );
  }

  if (status === "authenticated") {
    return (
      <button type="button" className="transition hover:text-white" onClick={handleLogout}>
        Log out
      </button>
    );
  }

  return (
    <Link className="transition hover:text-white" href="/login">
      Anmeldung
    </Link>
  );
}
