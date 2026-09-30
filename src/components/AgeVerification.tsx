import { useState } from "preact/hooks";
import { setAgeVerification } from "../lib/ageVerification";

export function AgeVerification({ onDone }: { onDone: (age: number) => void }) {
  const [selected, setSelected] = useState("");
  const [error, setError] = useState<string | null>(null);

  const confirm = () => {
    const n = parseInt(selected, 10);
    if (!Number.isInteger(n) || n < 1 || n > 99) {
      setError("Please scroll and select your age.");
      return;
    }
    const record = setAgeVerification(n);
    if (!record) {
      setError("Please scroll and select your age.");
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
        <select
          className="pvp-age-input"
          aria-label="Your age"
          value={selected}
          onChange={(e) => {
            setSelected((e.target as HTMLSelectElement).value);
            setError(null);
          }}
        >
          <option value="" disabled>
            Select your age
          </option>
          {Array.from({ length: 99 }, (_, i) => i + 1).map((age) => (
            <option key={age} value={age}>
              {age}
            </option>
          ))}
        </select>
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
