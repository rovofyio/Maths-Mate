import { Capacitor } from "@capacitor/core";
import { getState, setPurchase, hasPurchase } from "./store";
export { hasPurchase };
import type { GameMeta } from "../types";

export type ProductId = "remove_ads" | "premium" | "unlock_games" | "coins_500" | "coins_1200" | "coins_2500";

export interface Product {
  id: ProductId;
  price: string;
  label: string;
  emoji: string;
  blurb: string;
  kind: "entitlement" | "consumable";
}

export const PRODUCTS: Product[] = [
  { id: "remove_ads", price: "$2.99", label: "Remove Ads", emoji: "🚫", blurb: "No more ads, forever.", kind: "entitlement" },
  { id: "unlock_games", price: "$4.99", label: "Unlock 5 Games", emoji: "🎮", blurb: "Unlocks all 5 premium games.", kind: "entitlement" },
  { id: "premium", price: "$9.99", label: "Premium", emoji: "💎", blurb: "All games, no ads + 2× coins.", kind: "entitlement" },
  { id: "coins_500", price: "$0.99", label: "500 Coins", emoji: "🪙", blurb: "A pocketful of coins.", kind: "consumable" },
  { id: "coins_1200", price: "$1.99", label: "1,200 Coins", emoji: "💰", blurb: "A chest of coins.", kind: "consumable" },
  { id: "coins_2500", price: "$3.99", label: "2,500 Coins", emoji: "🏦", blurb: "A vault of coins.", kind: "consumable" },
];

export const COIN_PACKS: Partial<Record<ProductId, number>> = {
  coins_500: 500,
  coins_1200: 1200,
  coins_2500: 2500,
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
  return s.purchases.premium === true || s.purchases.unlock_games === true;
}

export function gamesUnlocked(): number {
  const s = getState();
  const premium = s.purchases.premium || s.purchases.unlock_games;
  return premium ? 10 : 5;
}

export function coinsBonus(): number {
  return hasPremium() ? 2 : 1;
}

export interface PurchaseOutcome {
  ok: boolean;
  product: Product;
}

/**
 * Native IAP goes through a Capacitor plugin (e.g. RevenueCat Purchases or a
 * store-specific IAP plugin) exposed on the Capacitor plugin registry. On web
 * and during development the flow is simulated so the whole economy is
 * testable; wire real store IDs in the native app.
 */
export async function purchaseProduct(id: ProductId): Promise<PurchaseOutcome> {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) throw new Error(`Unknown product ${id}`);

  const native = Capacitor.isNativePlatform();
  if (native) {
    try {
      const plugins = (window as unknown as { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor?.Plugins;
      const store = plugins?.["Purchases"] ?? plugins?.["InAppPurchase"];
      if (!store) {
        console.warn("No native IAP plugin registered — falling back to simulated purchase.");
      } else {
        await (store as { purchase: (o: unknown) => Promise<unknown> }).purchase({ productId: id });
        grantProduct(id);
        return { ok: true, product };
      }
    } catch (err) {
      console.error("Native purchase failed", err);
      return { ok: false, product };
    }
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

export function restorePurchases(): void {
  // With a native plugin this would query the store; on web/dev nothing to do.
}