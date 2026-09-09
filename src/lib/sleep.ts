import { getState } from "./store";
import { startMusic, suspendMusic } from "./music";
import { stopSpeaking } from "./tts";

let initialized = false;

/** Enter sleep mode: stop background music, free its memory, and cancel speech. */
export function enterSleepMode(): void {
  suspendMusic();
  try {
    stopSpeaking();
  } catch {
    /* ignore */
  }
  try {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

/** Leave sleep mode: resume music if the user has it enabled and the app is visible. */
export function exitSleepMode(): void {
  try {
    if (typeof document !== "undefined" && document.hidden) return;
  } catch {
    /* ignore */
  }
  try {
    if (getState().settings.music) startMusic();
  } catch {
    /* ignore */
  }
}

/**
 * On mobile (Capacitor) the WebView keeps running in the background unless we
 * stop explicitly. Hook native pause/resume plus web visibility/page events so
 * the app "sleeps": no background music and the Audio element is released.
 */
export function initSleepMode(): void {
  if (initialized) return;
  initialized = true;

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) enterSleepMode();
    else exitSleepMode();
  });
  window.addEventListener("pagehide", enterSleepMode);
  window.addEventListener("pageshow", exitSleepMode);
  try {
    document.addEventListener("freeze", enterSleepMode);
    document.addEventListener("resume", exitSleepMode);
  } catch {
    /* ignore */
  }

  // Native background/foreground (Android + iOS via Capacitor App plugin).
  import("@capacitor/app")
    .then(({ App }) => {
      App.addListener("pause", enterSleepMode).catch(() => {});
      App.addListener("resume", exitSleepMode).catch(() => {});
    })
    .catch(() => {
      /* web / plugin unavailable — visibility events above already cover sleep */
    });
}
