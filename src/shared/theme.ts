export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "opencore-theme";

export const SURFACE_COLORS: Record<AppTheme, string> = {
  light: "#f5f5f5",
  dark: "#000000",
};

export function resolveInitialTheme(stored: string | null, prefersDark: boolean): AppTheme {
  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}
