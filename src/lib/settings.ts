import { getState, updateSettings } from "./store";

export function applyTheme(theme: "light" | "dark"): void {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#16121f" : "#7b1fa2");
}

export function setTheme(theme: "light" | "dark"): void {
  updateSettings({ theme });
  applyTheme(theme);
}

export function initTheme(): void {
  applyTheme(getState().settings.theme);
}
