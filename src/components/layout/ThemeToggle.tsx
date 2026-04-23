import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from '@phosphor-icons/react';
import { Button } from "@/components/ui/button";

type ThemeMode = "light" | "dark" | "system";

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as ThemeMode | null;
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const dark = mode === "dark" || (mode === "system" && mq.matches);
      root.classList.toggle("dark", dark);
    };

    apply();
    localStorage.setItem("theme", mode);

    if (mode === "system") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [mode]);

  const cycle = () => setMode((m) => (m === "light" ? "dark" : m === "dark" ? "system" : "light"));

  const Icon = mode === "dark" ? Moon : mode === "system" ? Monitor : Sun;
  const label = mode === "dark" ? "Dark" : mode === "system" ? "System" : "Light";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycle}
      className="h-9 w-9 rounded-full"
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
