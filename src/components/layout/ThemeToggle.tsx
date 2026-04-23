import { useState, useEffect } from "react";
import { Moon, Sun } from '@phosphor-icons/react';
import { Button } from "@/components/ui/button";

type ThemeMode = "light" | "dark";

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    localStorage.setItem("theme", mode);
  }, [mode]);

  const cycle = () => setMode((m) => (m === "light" ? "dark" : "light"));

  const Icon = mode === "dark" ? Moon : Sun;
  const label = mode === "dark" ? "Dark" : "Light";

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

