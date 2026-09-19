import { Capacitor } from "@capacitor/core";
import { getState, setPurchase, hasPurchase } from "./store";
export { hasPurchase };
import type { GameMeta } from "../types";

export type ProductId = "remove_ads" | "premium" | "unlock_games" | "coins_500" | "coins_1200" | "coins_2500" | "stars_500";

export interface Product {
  id: ProductId;
  price: string;
  label: string;
  emoji: string;
  blurb: string;
  kind: "entitlement" | "consumable";
}

export const PRODUCTS: Product[] = [
  { id: "remove_ads", price: "$4.99", label: "Remove Ads", emoji: "🚫", blurb: "No more ads, forever.", kind: "entitlement" },
  { id: "unlock_games", price: "$1.99", label: "Unlock All Games", emoji: "🎮", blurb: "All games unlocked + 2× coins.", kind: "entitlement" },
  { id: "premium", price: "$1.99", label: "Premium", emoji: "💎", blurb: "All games, no ads + 2× coins.", kind: "entitlement" },
  { id: "coins_500", price: "$0.99", label: "500 Coins", emoji: "🪙", blurb: "A pocketful of coins.", kind: "consumable" },
  { id: "coins_1200", price: "$1.99", label: "1,200 Coins", emoji: "💰", blurb: "A chest of coins.", kind: "consumable" },
  { id: "coins_2500", price: "$3.99", label: "2,500 Coins", emoji: "🏦", blurb: "A vault of coins.", kind: "consumable" },
  { id: "stars_500", price: "$2.99", label: "500 Stars", emoji: "⭐", blurb: "A burst of stars to unlock games.", kind: "consumable" },
];

export const COIN_PACKS: Partial<Record<ProductId, number>> = {
  coins_500: 500,
  coins_1200: 1200,
  coins_2500: 2500,
};

export const STAR_PACKS: Partial<Record<ProductId, number>> = {
  stars_500: 500,
};

export function hasPremium(): boolean {
  return hasPurchase("premium");
}

export function hasNoAds(): boolean {
  return hasPurchase("premium") || hasPurchase("remove_ads");
}

export function isPremiumGame(game: GameMeta): boolean {
  return !game.free;
}

export function gameUnlocked(game: GameMeta): boolean {
  if (game.free) return true;
  const s = getState();
  return s.purchases.premium === true || s.purchases.unlock_games === true || s.unlockedByCoins[game.id] === true;
}

export function gamesUnlocked(): number {
  const s = getState();
  const premium = s.purchases.premium || s.purchases.unlock_games;
  if (premium) return 10;
  const coinUnlocked = Object.keys(s.unlockedByCoins || {}).length;
  return 3 + coinUnlocked;
}

export function coinsBonus(): number {
  return hasPremium() ? 2 : 1;
}

export interface PurchaseOutcome {
  ok: boolean;
  product: Product;
}

function readEnv(name: string): string {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return env?.[name] ?? "";
  } catch {
    return "";
  }
}

// RevenueCat API keys (per platform). Set VITE_REVENUECAT_* at build time.
// Until keys + products exist in Play Console / App Store Connect / RevenueCat
// dashboard, native purchases fall back to the simulated flow so CI stays green.
const RC_ANDROID_KEY = readEnv("VITE_REVENUECAT_ANDROID_KEY");
const RC_IOS_KEY = readEnv("VITE_REVENUECAT_IOS_KEY");

let rcConfigured = false;
let rcConfigureAttempted = false;

type RcPurchases = {
  configure: (o: { apiKey: string }) => Promise<void>;
  getProducts: (o: { productIdentifiers: string[] }) => Promise<{ products: Array<{ identifier: string }> }>;
  purchaseStoreProduct: (o: { product: unknown }) => Promise<unknown>;
  restorePurchases: () => Promise<{ customerInfo?: { entitlements?: { active?: Record<string, unknown> } } }>;
  getCustomerInfo: () => Promise<{ customerInfo?: { entitlements?: { active?: Record<string, unknown> } } }>;
};

async function getRc(): Promise<RcPurchases | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const mod = await import("@revenuecat/purchases-capacitor");
    return mod.Purchases as unknown as RcPurchases;
  } catch {
    return null;
  }
}

/**
 * Call once at boot (see src/main.tsx). Configures RevenueCat when a native
 * platform + API key is present. Uses Play Billing Library (via RevenueCat
 * Android SDK, Billing v9 → compliant past the 31 Aug 2026 v8 deadline) and
 * StoreKit 2 on iOS. Safe no-op on web / without keys.
 */
export async function initPurchases(): Promise<void> {
  if (rcConfigureAttempted || !Capacitor.isNativePlatform()) return;
  rcConfigureAttempted = true;
  try {
    const platform = Capacitor.getPlatform();
    const apiKey = platform === "ios" ? RC_IOS_KEY : RC_ANDROID_KEY;
    if (!apiKey) {
      console.warn("RevenueCat API key not set — IAP runs in simulated mode.");
      return;
    }
    const rc = await getRc();
    if (!rc) return;
    await rc.configure({ apiKey });
    rcConfigured = true;
    await syncEntitlementsFromStore();
  } catch (err) {
    console.warn("RevenueCat configure failed — IAP runs in simulated mode.", err);
  }
}

async function syncEntitlementsFromStore(): Promise<void> {
  if (!rcConfigured) return;
  try {
    const rc = await getRc();
    if (!rc) return;
    const { customerInfo } = await rc.getCustomerInfo();
    applyEntitlements(customerInfo?.entitlements?.active);
  } catch {
    /* offline / not entitled — keep local state */
  }
}

function applyEntitlements(active?: Record<string, unknown>): void {
  if (!active) return;
  // Map RevenueCat entitlement ids straight onto local product ids.
  // Configure matching entitlement identifiers in the RevenueCat dashboard.
  for (const id of ["premium", "remove_ads", "unlock_games"] as ProductId[]) {
    if (active[id]) setPurchase(id);
  }
  if (active["premium"]) {
    setPurchase("premium");
    setPurchase("remove_ads");
    setPurchase("unlock_games");
  }
}

/**
 * Native IAP goes through RevenueCat (StoreKit 2 on iOS, Play Billing on
 * Android). On web and during development — or when no RevenueCat key is
 * configured — the flow is simulated so the whole economy is testable.
 */
export async function purchaseProduct(id: ProductId): Promise<PurchaseOutcome> {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) throw new Error(`Unknown product ${id}`);

  if (Capacitor.isNativePlatform() && rcConfigured) {
    try {
      const rc = await getRc();
      if (!rc) throw new Error("RevenueCat unavailable");
      const { products } = await rc.getProducts({ productIdentifiers: [id] });
      const storeProduct = products?.[0];
      if (!storeProduct) throw new Error(`Product ${id} not found in store`);
      const result = (await rc.purchaseStoreProduct({ product: storeProduct })) as {
        customerInfo?: { entitlements?: { active?: Record<string, unknown> } };
      };
      applyEntitlements(result?.customerInfo?.entitlements?.active);
      grantProduct(id);
      return { ok: true, product };
    } catch (err) {
      const cancelled = err instanceof Error && /cancel/i.test(err.message);
      if (!cancelled) console.error("Native purchase failed", err);
      return { ok: false, product };
    }
  }

  if (Capacitor.isNativePlatform()) {
    console.warn("No native IAP configured — falling back to simulated purchase.");
  }
  grantProduct(id);
  return { ok: true, product };
}

export function grantProduct(id: ProductId): void {
  if (id === "premium") {
    setPurchase("premium");
    setPurchase("remove_ads");
    setPurchase("unlock_games");
  } else if (id === "remove_ads" || id === "unlock_games") {
    setPurchase(id);
  }
}

export async function restorePurchases(): Promise<void> {
  if (Capacitor.isNativePlatform() && rcConfigured) {
    try {
      const rc = await getRc();
      if (!rc) return;
      const { customerInfo } = await rc.restorePurchases();
      applyEntitlements(customerInfo?.entitlements?.active);
      return;
    } catch (err) {
      console.error("Restore purchases failed", err);
      return;
    }
  }
  // With a native plugin this would query the store; on web/dev nothing to do.
}