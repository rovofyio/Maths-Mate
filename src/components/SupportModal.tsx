import { useState } from "preact/hooks";
import { setPurchase, addCoins } from "../lib/store";
import { showToast } from "../lib/toast";

export function SupportModal({ onClose }: { onClose: () => void }) {
  const [actioning, setActioning] = useState(false);

  const handleNoAds = () => {
    setActioning(true);
    setPurchase("remove_ads");
    showToast("🚫 Ads removed!");
    setActioning(false);
    onClose();
  };

  const handle1000Coins = () => {
    setActioning(true);
    addCoins(1000);
    showToast("🪙 +1000 coins!");
    setActioning(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="support-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2>Support Math Aura</h2>
        <p className="support-sub">Choose how you'd like to support the project!</p>

        <div className="support-options">
          <div className="support-card">
            <div className="support-card-emoji">🚫</div>
            <div className="support-card-name">No Ads</div>
            <div className="support-card-blurb">Remove all ads forever</div>
            <button className="btn-primary" disabled={actioning} onClick={handleNoAds}>
              {actioning ? "..." : "Remove Ads"}
            </button>
          </div>

          <div className="support-card">
            <div className="support-card-emoji">🪙</div>
            <div className="support-card-name">1,000 Coins</div>
            <div className="support-card-blurb">Get 1000 coins instantly</div>
            <button className="btn-primary" disabled={actioning} onClick={handle1000Coins}>
              {actioning ? "..." : "Get Coins"}
            </button>
          </div>

          <div className="support-card">
            <div className="support-card-emoji">💎</div>
            <div className="support-card-name">Donation</div>
            <div className="support-card-blurb">Buy us a coffee ☕</div>
            <a className="btn-primary" href="https://www.paypal.com/donate?business=your-email&currency=USD&amount=5" target="_blank" rel="noopener noreferrer">
              Donate
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
