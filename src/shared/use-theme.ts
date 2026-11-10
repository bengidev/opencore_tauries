import { useLayoutEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { type AppTheme, SURFACE_COLORS, THEME_STORAGE_KEY, resolveInitialTheme } from "./theme";

function readStoredTheme(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getInitialTheme(): AppTheme {
  return resolveInitialTheme(
    readStoredTheme(),
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
}

function syncNativeTheme(theme: AppTheme): void {
  if (!("__TAURI_INTERNALS__" in window)) return;
  const windowHandle = getCurrentWindow();
  void Promise.all([
    windowHandle.setTheme(theme),
    windowHandle.setBackgroundColor(SURFACE_COLORS[theme]),
  ]).catch(() => undefined);
}

function setBrowserThemeColor(color: string): void {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.append(meta);
  }
  meta.content = color;
}

export function useTheme(): { theme: AppTheme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage may be unavailable (private mode, quota); theming still applies.
    }
    setBrowserThemeColor(SURFACE_COLORS[theme]);
    syncNativeTheme(theme);
  }, [theme]);

  function toggleTheme(): void {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }

  return { theme, toggleTheme };
}
