import { signal } from "@preact/signals";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import {
  AppUpdate,
  AppUpdateAvailability,
  FlexibleUpdateInstallStatus,
} from "@capawesome/capacitor-app-update";
import { showToast } from "./toast";

// True when a flexible update has finished downloading and is ready to install.
// UI should show a persistent "Restart to update" banner (toast auto-dismisses).
export const updateReadySignal = signal(false);
// 0..1 download progress while flexible update is downloading, null otherwise.
export const updateProgressSignal = signal<number | null>(null);

let initialized = false;
let listenerAttached = false;
let lastCheck = 0;
const RESUME_THROTTLE_MS = 60 * 60 * 1000; // 1 hour between resume checks

function isAndroid(): boolean {
  try {
    return Capacitor.getPlatform() === "android";
  } catch {
    return false;
  }
}

async function attachFlexibleListener(): Promise<void> {
  if (listenerAttached || !isAndroid()) return;
  try {
    await AppUpdate.addListener("onFlexibleUpdateStateChange", (state) => {
      const status = state.installStatus;
      if (status === FlexibleUpdateInstallStatus.DOWNLOADED) {
        updateProgressSignal.value = null;
        updateReadySignal.value = true;
        showToast("Update ready — restart to install");
      } else if (status === FlexibleUpdateInstallStatus.DOWNLOADING) {
        updateReadySignal.value = false;
        const { bytesDownloaded, totalBytesToDownload } = state;
        if (
          typeof bytesDownloaded === "number" &&
          typeof totalBytesToDownload === "number" &&
          totalBytesToDownload > 0
        ) {
          updateProgressSignal.value = Math.min(
            1,
            Math.max(0, bytesDownloaded / totalBytesToDownload)
          );
        } else {
          updateProgressSignal.value = null;
        }
      } else if (
        status === FlexibleUpdateInstallStatus.FAILED ||
        status === FlexibleUpdateInstallStatus.CANCELED
      ) {
        updateProgressSignal.value = null;
        updateReadySignal.value = false;
      } else if (status === FlexibleUpdateInstallStatus.INSTALLED) {
        updateProgressSignal.value = null;
        updateReadySignal.value = false;
      }
    });
    listenerAttached = true;
  } catch {
    // Listener not supported (e.g. web / sideloaded build) — ignore.
  }
}

/**
 * Check Play for an update and start a flexible download if available.
 * Safe to call on web/iOS/sideloaded builds — it no-ops silently.
 * Only works when the app is installed from the Play Store with a higher
 * versionCode published.
 */
export async function checkForFlexibleUpdate(opts?: {
  userInitiated?: boolean;
}): Promise<void> {
  if (!isAndroid()) return;
  const now = Date.now();
  if (!opts?.userInitiated && now - lastCheck < RESUME_THROTTLE_MS) return;
  lastCheck = now;

  try {
    const info = await AppUpdate.getAppUpdateInfo();

    // Resume case: update already downloaded but not installed yet.
    if (info.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
      updateReadySignal.value = true;
      return;
    }
    if (info.updateAvailability === AppUpdateAvailability.UPDATE_IN_PROGRESS) {
      // Download in progress — listener will flip updateReady when done.
      await attachFlexibleListener();
      return;
    }
    if (info.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) {
      return;
    }
    if (!info.flexibleUpdateAllowed) return;

    await attachFlexibleListener();
    await AppUpdate.startFlexibleUpdate();
  } catch {
    // Play not available, no update, or user cancelled — stay silent.
  }
}

/** Complete a downloaded flexible update (restarts the app). */
export async function completeUpdateAndRestart(): Promise<void> {
  if (!isAndroid()) return;
  try {
    await AppUpdate.completeFlexibleUpdate();
    updateReadySignal.value = false;
  } catch {
    showToast("Restart the app to finish updating");
  }
}

/** Fallback: open the Play Store listing (e.g. iOS manual path reuse). */
export async function openStoreListing(): Promise<void> {
  try {
    await AppUpdate.openAppStore();
  } catch {
    /* ignore */
  }
}

/**
 * Call once at boot. Checks immediately + on every foreground resume.
 * Throttled to avoid Play quota spam.
 */
export function initAppUpdates(): void {
  if (initialized || !isAndroid()) return;
  initialized = true;
  // Defer slightly so splash / first paint isn't blocked by Play API.
  setTimeout(() => void checkForFlexibleUpdate({ userInitiated: true }), 3000);
  try {
    void App.addListener("resume", () => {
      // If an update finished while we were away, prompt install first.
      if (updateReadySignal.value) return;
      void checkForFlexibleUpdate();
    });
  } catch {
    /* App plugin unavailable — boot check already ran */
  }
}
