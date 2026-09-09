import { state, unlockGame, unlockGameWithXp, GAME_COIN_PRICE, GAME_STAR_PRICE } from "../lib/store";
import { showToast } from "../lib/toast";
import type { GameMeta } from "../types";

interface Props {
  game: GameMeta;
  onClose: () => void;
  onUnlocked: () => void;
}

export function UnlockGameModal({ game, onClose, onUnlocked }: Props) {
  const s = state.value;
  const canCoins = s.coins >= GAME_COIN_PRICE;
  const canStars = s.xp >= GAME_STAR_PRICE;

  const buyWithCoins = () => {
    if (unlockGame(game.id)) {
      showToast(`🎮 ${game.name} unlocked!`);
      onUnlocked();
    } else {
      showToast("Not enough coins!");
    }
  };

  const buyWithStars = () => {
    if (unlockGameWithXp(game.id)) {
      showToast(`🎮 ${game.name} unlocked!`);
      onUnlocked();
    } else {
      showToast("Not enough stars!");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="paywall" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="paywall-hero">{game.emoji}</div>
        <h2>Unlock {game.name}?</h2>
        <p className="paywall-sub">Choose how to unlock this game:</p>

        <div className="paywall-products">
          <div className="product-card">
            <div className="product-info">
              <span className="product-emoji">🪙</span>
              <div>
                <div className="product-name">
                  {GAME_COIN_PRICE} coins
                </div>
                <div className="product-blurb">You have 🪙 {s.coins}</div>
              </div>
            </div>
            <button className="btn-buy" disabled={!canCoins} onClick={buyWithCoins}>
              {canCoins ? "Unlock" : "Locked"}
            </button>
          </div>

          <div className="product-card">
            <div className="product-info">
              <span className="product-emoji">⭐</span>
              <div>
                <div className="product-name">
                  {GAME_STAR_PRICE} stars
                </div>
                <div className="product-blurb">You have ⭐ {s.xp}</div>
              </div>
            </div>
            <button className="btn-buy" disabled={!canStars} onClick={buyWithStars}>
              {canStars ? "Unlock" : "Locked"}
            </button>
          </div>
        </div>

        <button className="btn-ghost" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
