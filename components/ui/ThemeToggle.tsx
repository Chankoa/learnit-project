"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "learnit-theme";

function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}

function getStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getActiveTheme(): Theme {
  const documentTheme = document.documentElement.dataset.theme;

  if (isTheme(documentTheme)) {
    return documentTheme;
  }

  const storedTheme = getStoredTheme();

  if (isTheme(storedTheme)) {
    return storedTheme;
  }

  return getSystemTheme();
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function storeTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The theme still changes even when storage is unavailable.
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const activeTheme = getActiveTheme();
    applyTheme(activeTheme);
    setTheme(activeTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleSystemThemeChange() {
      if (isTheme(getStoredTheme())) {
        return;
      }

      const nextTheme = getSystemTheme();
      applyTheme(nextTheme);
      setTheme(nextTheme);
    }

    function handleStorageChange(event: StorageEvent) {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      const nextTheme = isTheme(event.newValue) ? event.newValue : getSystemTheme();
      applyTheme(nextTheme);
      setTheme(nextTheme);
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  function toggleTheme() {
    const currentTheme = theme ?? getActiveTheme();
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
    storeTheme(nextTheme);
    setTheme(nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      className="theme-toggle inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-text-strong transition hover:border-border-strong"
      type="button"
      onClick={toggleTheme}
    >
      <Moon className="theme-toggle__icon theme-toggle__icon--moon" size={18} aria-hidden="true" />
      <Sun className="theme-toggle__icon theme-toggle__icon--sun" size={18} aria-hidden="true" />
    </button>
  );
}
