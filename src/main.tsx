import { render } from "preact";
import { App } from "./app";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { initTheme, initPowerMode } from "./lib/settings";
import { initPerf } from "./lib/perf";
import { getState } from "./lib/store";
import { startMusic } from "./lib/music";
import { initSleepMode } from "./lib/sleep";
import "./styles.css";

// Apply power-saver before first paint so low-end devices never
// pay for heavy animations on boot. initTheme/initPowerMode read settings.
initPerf(() => {
  try {
    return getState().settings.powerMode;
  } catch {
    return "auto";
  }
});
initTheme();
initPowerMode();
// Puts the app to sleep on mobile background/lock (stops music, frees memory).
initSleepMode();

render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  document.getElementById("app")!
);

// Music is ON by default. Browsers block autoplay until the first interaction,
// so try immediately and retry on first gesture. On power-saver / low-end
// devices we skip the boot-time autostart to save CPU, memory and battery —
// music still starts on the first tap if enabled.
import { isPowerSaverActive } from "./lib/perf";
const tryAutostart = (opts?: { userGesture?: boolean }) => {
  try {
    // Boot-time autoplay is skipped in saver mode; an explicit first tap
    // still starts music so the toggle keeps working on low-end devices.
    if (isPowerSaverActive() && !opts?.userGesture) return;
    if (getState().settings.music) startMusic();
  } catch {
    /* ignore */
  }
};

tryAutostart();

const resumeMusic = () => {
  tryAutostart({ userGesture: true });
  window.removeEventListener("pointerdown", resumeMusic);
  window.removeEventListener("touchend", resumeMusic);
  window.removeEventListener("keydown", resumeMusic);
};
window.addEventListener("pointerdown", resumeMusic);
window.addEventListener("touchend", resumeMusic);
window.addEventListener("keydown", resumeMusic);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
