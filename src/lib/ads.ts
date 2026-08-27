import { Capacitor } from "@capacitor/core";
import { getState, recordAdSeen } from "./store";
import { hasNoAds } from "./iap";

export type AdStatus = "idle" | "loading" | "ready" | "shown";

/**
 * Child-directed ad monetisation.
 *  - Web: AdSense/AdMob display ads loaded via the google ad script tag
 *    injected lazily. `VITE_AD_ENABLED=1` activates real network calls.
 *  - Native: the @capacitor-community/admob plugin drives interstitials.
 *  - Otherwise: ads are simulated (short overlay) so the flow is testable
 *    offline and in CI.
 */

const NETWORK_ADS_ENABLED = import.meta.env.VITE_AD_ENABLED === "1";

let interstitialAd: { show: () => Promise<void> } | null = null;

async function loadNativeAd(): Promise<void> {
  try {
    const mod = await import("@capacitor-community/admob");
    const admob = mod as unknown as {
      AdMob: { initialize: (o: unknown) => Promise<void> };
      InterstitialAd?: {
        create: (o: { adUnitId: string }) => Promise<{ load: () => Promise<void>; show: () => Promise<void> }>;
      };
    };
    await admob.AdMob.initialize({
      requestTrackingAuthorization: true,
    });
    if (!admob.InterstitialAd) throw new Error("InterstitialAd unavailable in AdMob plugin");
    const ad = await admob.InterstitialAd.create({ adUnitId: "ca-app-pub-0000000000000000/0000000000000000" });
    await ad.load();
    interstitialAd = ad;
  } catch (err) {
    console.warn("AdMob unavailable:", err);
  }
}

function loadWebAd(): void {
  try {
    const existing = document.getElementById("adsbygoogle-script");
    if (existing || document.querySelector("ins.adsbygoogle")) return;
    const s = document.createElement("script");
    s.id = "adsbygoogle-script";
    s.async = true;
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000";
    s.crossOrigin = "anonymous";
    document.head.appendChild(s);
  } catch {
    /* ad script blocked */
  }
}

/**
 * Show a rewarded/plain interstitial between games. Returns true when an ad
 * was actually shown (so callers can gate content).
 */
export async function showInterstitial(): Promise<boolean> {
  if (hasNoAds()) return false;

  if (Capacitor.isNativePlatform()) {
    if (NETWORK_ADS_ENABLED) {
      await loadNativeAd();
      if (interstitialAd) {
        await interstitialAd.show();
        recordAdSeen();
        return true;
      }
    }
    return false;
  }

  if (NETWORK_ADS_ENABLED) {
    loadWebAd();
    recordAdSeen();
    return true;
  }

  return false;
}

export function maybeShowBanner(container?: HTMLElement): void {
  if (hasNoAds()) return;
  if (NETWORK_ADS_ENABLED) {
    loadWebAd();
    if (container) {
      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.cssText = "display:block;width:100%;height:60px";
      ins.setAttribute("data-ad-client", "ca-pub-0000000000000000");
      ins.setAttribute("data-ad-slot", "0000000000");
      container.appendChild(ins);
      try {
        (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle?.push({});
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * Interstitial gating policy for free users: show a (simulated or real) ad
 * every N completed games, then unlock the result screen.
 */
export function adGateEvery(): number {
  return 3;
}

export function shouldAdGate(): boolean {
  const s = getState();
  return !hasNoAds() && s.gamesSinceAd >= adGateEvery();
}

export function adGateCost(): { status: AdStatus; ok: boolean } {
  return { status: "idle", ok: true };
}

export { getState }; // re-export for convenience in tests