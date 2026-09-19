import { setConsent } from "../lib/consent";

export function CookieConsent({ onDone }: { onDone: (choice: "accepted" | "rejected") => void }) {
  const choose = (choice: "accepted" | "rejected") => {
    setConsent(choice);
    onDone(choice);
  };

  return (
    <div className="modal-overlay cookie-overlay" role="dialog" aria-modal="true" aria-label="Cookie consent">
      <div className="cookie-modal">
        <div className="cookie-emoji" aria-hidden="true">
          🍪
        </div>
        <h2>We use cookies</h2>
        <p className="cookie-text">
          Maths Aura itself does not set cookies. Our advertising partner (Google AdMob / AdSense) uses cookies and
          local storage for fraud prevention, frequency capping, and aggregated ad reporting.
        </p>
        <p className="cookie-text">
          You can read the full details in our Privacy Policy (Settings → Privacy Policy).
        </p>
        <div className="cookie-actions">
          <button className="btn-primary" onClick={() => choose("accepted")}>
            Accept
          </button>
          <button className="btn-ghost" onClick={() => choose("rejected")}>
            Reject
          </button>
        </div>
        <p className="muted small cookie-note">You can change your choice anytime in Settings → Privacy &amp; Legal.</p>
      </div>
    </div>
  );
}
