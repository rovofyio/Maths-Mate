import { useState } from "preact/hooks";
import { setAgeVerification } from "../lib/ageVerification";

export function AgeVerification({ onDone }: { onDone: (age: number) => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const confirm = () => {
    const n = parseInt(input, 10);
    if (!Number.isInteger(n) || n < 1 || n > 99) {
      setError("Please enter a valid age (1–99).");
      return;
    }
    const record = setAgeVerification(n);
    if (!record) {
      setError("Please enter a valid age (1–99).");
      return;
    }
    setError(null);
    onDone(record.age);
  };

  return (
    <div className="modal-overlay age-overlay" role="dialog" aria-modal="true" aria-label="Age verification">
      <div className="cookie-modal">
        <div className="cookie-emoji" aria-hidden="true">
          🎂
        </div>
        <h2>How old are you?</h2>
        <p className="cookie-text">
          Maths Aura needs your age once to show the right games for you.
        </p>
        <input
          className="pvp-age-input"
          type="number"
          min={1}
          max={99}
          inputMode="numeric"
          placeholder="Enter your age"
          aria-label="Your age"
          value={input}
          onInput={(e) => setInput((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") confirm();
          }}
        />
        {error && (
          <p className="muted small" role="alert" style={{ color: "var(--danger, #e74c3c)" }}>
            {error}
          </p>
        )}
        <div className="cookie-actions">
          <button className="btn-primary" onClick={confirm}>
            Confirm
          </button>
        </div>
        <p className="muted small cookie-note">You only need to do this once on this device.</p>
      </div>
    </div>
  );
}
