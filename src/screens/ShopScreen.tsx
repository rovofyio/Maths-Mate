import { useState } from "preact/hooks";
import { GAMES } from "../games";
import { COIN_PACKS, STAR_PACKS, PRODUCTS, gameUnlocked, purchaseProduct, hasPurchase } from "../lib/iap";
import type { ProductId } from "../lib/iap";
import { addCoins, addXp, state, unlockGame } from "../lib/store";
import { showToast } from "../lib/toast";

const GAME_PRICE = 100;

export function ShopScreen() {
  const [busy, setBusy] = useState<ProductId | null>(null);
  const s = state.value;

  const buyCoins = async (id: ProductId) => {
    setBusy(id);
    try {
      const { ok } = await purchaseProduct(id);
      if (ok && COIN_PACKS[id]) {
        addCoins(COIN_PACKS[id]);
        showToast(`🪙 +${COIN_PACKS[id]} coins!`);
      } else if (!ok) {
        showToast("Purchase was not completed.");
      }
    } finally {
      setBusy(null);
    }
  };

  const buyStars = async (id: ProductId) => {
    setBusy(id);
    try {
      const { ok } = await purchaseProduct(id);
      if (ok && STAR_PACKS[id]) {
        addXp(STAR_PACKS[id]);
        showToast(`⭐ +${STAR_PACKS[id]} stars!`);
      } else if (!ok) {
        showToast("Purchase was not completed.");
      }
    } finally {
      setBusy(null);
    }
  };

  const buyBundle = async (id: ProductId) => {
    setBusy(id);
    try {
      const { ok, product } = await purchaseProduct(id);
      showToast(ok ? `${product.emoji} ${product.label} unlocked!` : "Purchase was not completed.");
    } finally {
      setBusy(null);
    }
  };

  const buyGame = (gameId: string, gameName: string) => {
    if (unlockGame(gameId)) {
      showToast(`🎮 ${gameName} unlocked!`);
    } else {
      showToast("Not enough coins — grab a coin pack below!");
    }
  };

  const packs = PRODUCTS.filter((p) => COIN_PACKS[p.id]);
  const starPacks = PRODUCTS.filter((p) => STAR_PACKS[p.id]);
  const bundles = PRODUCTS.filter((p) => p.kind === "entitlement");

  return (
    <div className="page">
      <div className="games-head">
        <h1 className="page-title">💎 Shop</h1>
        <div className="topbar-stats">
          <div className="stat-chip" title="Coins">
            🪙 {s.coins}
          </div>
          <div className="stat-chip" title="Stars">
            ⭐ {s.xp}
          </div>
        </div>
      </div>

      <h2 className="section-title">🎮 Games — unlock individually</h2>
      <p className="muted small">Unlock each premium game for 🪙 {GAME_PRICE} coins.</p>
      <div className="paywall-products">
        {GAMES.map((g) => {
          const unlocked = gameUnlocked(g);
          return (
            <div key={g.id} className={`product-card ${unlocked ? "owned" : ""}`}>
              <div className="product-info">
                <span className="product-emoji">{unlocked ? g.emoji : g.free ? g.emoji : "🔒"}</span>
                <div>
                  <div className="product-name">{g.name}</div>
                  <div className="product-blurb">
                    {g.free ? "Free" : unlocked ? "Unlocked" : `${g.blurb}`}
                  </div>
                </div>
              </div>
              {g.free || unlocked ? (
                <span className="btn-ghost connected-btn">{g.free ? "Free ✓" : "Owned ✓"}</span>
              ) : (
                <button
                  className="btn-buy"
                  disabled={s.coins < GAME_PRICE}
                  onClick={() => buyGame(g.id, g.name)}
                >
                  🪙 {GAME_PRICE}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="section-title">🪙 Coin packs</h2>
      <p className="muted small">Top up coins to unlock games individually.</p>
      <div className="coin-packs">
        {packs.map((p) => (
          <button key={p.id} className="coin-pack" disabled={busy !== null} onClick={() => buyCoins(p.id)}>
            <span className="coin-pack-emoji">{p.emoji}</span>
            <span className="coin-pack-amount">+{COIN_PACKS[p.id]}</span>
            <span className="coin-pack-price">{busy === p.id ? "..." : p.price}</span>
          </button>
        ))}
      </div>

      <h2 className="section-title">⭐ Star packs</h2>
      <p className="muted small">Top up stars to unlock games individually.</p>
      <div className="coin-packs">
        {starPacks.map((p) => (
          <button key={p.id} className="coin-pack" disabled={busy !== null} onClick={() => buyStars(p.id)}>
            <span className="coin-pack-emoji">{p.emoji}</span>
            <span className="coin-pack-amount">+{STAR_PACKS[p.id]}</span>
            <span className="coin-pack-price">{busy === p.id ? "..." : p.price}</span>
          </button>
        ))}
      </div>

      <h2 className="section-title">💎 Bundles</h2>
      <div className="paywall-products">
        {bundles.map((p) => (
          <div key={p.id} className={`product-card ${hasPurchase(p.id) ? "owned" : ""}`}>
            <div className="product-info">
              <span className="product-emoji">{p.emoji}</span>
              <div>
                <div className="product-name">{p.label}</div>
                <div className="product-blurb">{p.blurb}</div>
              </div>
            </div>
            <button
              className="btn-buy"
              disabled={busy !== null || hasPurchase(p.id)}
              onClick={() => buyBundle(p.id)}
            >
              {hasPurchase(p.id) ? "Owned ✓" : busy === p.id ? "..." : p.price}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
