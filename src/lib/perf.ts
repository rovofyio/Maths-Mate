import type { PlayerSettings } from "../types";

export type PowerMode = "auto" | "full" | "saver";

function nav(): Navigator | null {
  try {
    return typeof navigator !== "undefined" ? navigator : null;
  } catch {
    return null;
  }
}

/** True when the OS/browser asks for reduced motion (often low-power mode). */
export function prefersReducedMotion(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return false;
  }
}

/** True when the browser signals data saving (Data Saver / saveData / slow net). */
export function prefersReducedData(): boolean {
  try {
    const n = nav() as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    const c = n?.connection;
    if (!c) return false;
    if (c.saveData === true) return true;
    const t = (c.effectiveType || "").toLowerCase();
    return t === "slow-2g" || t === "2g";
  } catch {
    return false;
  }
}

export interface DeviceCaps {
  cores: number | null;
  ramGB: number | null;
  lowEnd: boolean;
  reason: string;
}

/**
 * Heuristic for "low hardware" devices. Conservative: only flags clearly
 * constrained devices so capable phones keep full effects by default.
 *  - <= 4 CPU cores, or
 *  - <= 3 GB RAM (navigator.deviceMemory, Chromium Android), or
 *  - Data Saver / 2G, or
 *  - OS reduced-motion (often Battery Saver on Android/iOS).
 */
export function getDeviceCaps(): DeviceCaps {
  const n = nav() as (Navigator & { deviceMemory?: number }) | null;
  const cores = typeof n?.hardwareConcurrency === "number" ? n.hardwareConcurrency : null;
  const ramGB = typeof n?.deviceMemory === "number" ? n.deviceMemory : null;
  const reasons: string[] = [];
  let lowEnd = false;

  if (cores !== null && cores <= 4) {
    lowEnd = true;
    reasons.push(`${cores} CPU cores`);
  }
  if (ramGB !== null && ramGB <= 3) {
    lowEnd = true;
    reasons.push(`~${ramGB}GB RAM`);
  }
  if (prefersReducedData()) {
    lowEnd = true;
    reasons.push("data saver / slow network");
  }
  if (prefersReducedMotion()) {
    lowEnd = true;
    reasons.push("reduced motion requested");
  }

  return { cores, ramGB, lowEnd, reason: reasons.join(", ") };
}

export function isLowEndDevice(): boolean {
  return getDeviceCaps().lowEnd;
}

/** Resolve the effective saver state from the user's powerMode + device caps. */
export function shouldUsePowerSaver(mode: PowerMode | undefined): boolean {
  if (mode === "saver") return true;
  if (mode === "full") return false;
  return isLowEndDevice(); // "auto" (or legacy unset) follows the device
}

export function resolvePowerMode(settings: Pick<PlayerSettings, "powerMode">): boolean {
  return shouldUsePowerSaver(settings.powerMode);
}

/** Read current applied state (set by applyPowerSaver). */
export function isPowerSaverActive(): boolean {
  try {
    return document.documentElement.dataset.power === "saver";
  } catch {
    return false;
  }
}

/**
 * Apply saver to <html data-power="saver|full">. Cheap: a single attribute
 * flip that CSS uses to disable heavy animations/filters/backdrops.
 */
export function applyPowerSaver(active: boolean): void {
  try {
    const el = document.documentElement;
    el.dataset.power = active ? "saver" : "full";
    el.classList.toggle("power-saver", active);
  } catch {
    /* ignore */
  }
}

/** Re-read settings from storage state and re-apply. Call after setting change. */
export function refreshPowerSaver(getMode: () => PowerMode | undefined): boolean {
  const active = shouldUsePowerSaver(getMode());
  applyPowerSaver(active);
  return active;
}

let perfInitDone = false;

/**
 * Init once at boot: apply immediately (before first paint when possible),
 * then keep in sync with OS changes (battery-saver toggles, data-saver).
 */
export function initPerf(getMode: () => PowerMode | undefined): void {
  applyPowerSaver(shouldUsePowerSaver(getMode()));
  if (perfInitDone) return;
  perfInitDone = true;
  try {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => applyPowerSaver(shouldUsePowerSaver(getMode()));
    if (typeof mq.addEventListener === "function") mq.addEventListener("change", onChange);
    else if (typeof (mq as MediaQueryList & { addListener?: (f: () => void) => void }).addListener === "function") {
      (mq as MediaQueryList & { addListener: (f: () => void) => void }).addListener(onChange);
    }
    const n = nav() as (Navigator & { connection?: { addEventListener?: (t: string, f: () => void) => void } }) | null;
    n?.connection?.addEventListener?.("change", onChange);
  } catch {
    /* ignore */
  }
}
