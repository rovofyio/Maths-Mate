import { useState } from "preact/hooks";
import { PRODUCTS, purchaseProduct, hasPurchase, COIN_PACKS } from "../lib/iap";
import { addCoins } from "../lib/store";
import { showToast } from "../lib/toast";
import type { ProductId } from "../lib/iap";

export function Paywall({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState<ProductId | null>(null);

  const buy = async (id: ProductId) => {
    setBusy(id);
    try {
      const { ok, product } = await purchaseProduct(id);
      if (ok) {
        if (COIN_PACKS[id]) {
          addCoins(COIN_PACKS[id]);
          showToast(`🪙 +${COIN_PACKS[id]} coins!`);
        } else {
          showToast(`${product.emoji} ${product.label} unlocked!`);
        }
        onClose();
      } else {
        showToast("Purchase was not completed.");
      }
    } finally {
      setBusy(null);
    }
  };

  const entitlements = PRODUCTS.filter((p) => p.kind === "entitlement");
  const packs = PRODUCTS.filter((p) => p.kind === "consumable");

  return (
    <div className="modal-overlay">
      <div className="paywall">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="paywall-hero">💎</div>
        <h2>Support Math Aura</h2>
        <p className="paywall-sub">Unlock all games, remove ads, and power up your maths journey!</p>

        <div className="paywall-products">
          {entitlements.map((p) => (
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
                onClick={() => buy(p.id)}
              >
                {hasPurchase(p.id) ? "Owned ✓" : busy === p.id ? "..." : p.price}
              </button>
            </div>
          ))}
        </div>

        <h3 className="paywall-h3">Coin packs</h3>
        <div className="coin-packs">
          {packs.map((p) => (
            <button key={p.id} className="coin-pack" disabled={busy !== null} onClick={() => buy(p.id)}>
              <span className="coin-pack-emoji">{p.emoji}</span>
              <span className="coin-pack-amount">+{COIN_PACKS[p.id]}</span>
              <span className="coin-pack-price">{p.price}</span>
            </button>
          ))}
        </div>

        <button className="btn-ghost" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  );
}