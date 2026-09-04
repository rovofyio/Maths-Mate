import { useState } from "preact/hooks";
import type { ComponentChildren } from "preact";

export function GameShell({
  emoji,
  name,
  pills = [],
  onQuit,
  className = "",
  children,
}: {
  emoji: string;
  name: string;
  pills?: string[];
  onQuit: () => void;
  className?: string;
  children: ComponentChildren;
}) {
  const [paused, setPaused] = useState(false);

  return (
    <div className={`game-screen ${className}`.trim()}>
      <div className="game-hud">
        <button className="quit-btn" aria-label="Pause game" onClick={() => setPaused(true)}>
          ←
        </button>
        <div className="hud-center">
          <span className="hud-pill">
            {emoji} {name}
          </span>
          {pills.map((p, i) => (
            <span key={i} className="hud-pill">
              {p}
            </span>
          ))}
        </div>
      </div>
      {children}

      {paused && (
        <div className="pause-overlay" role="dialog" aria-modal="true" aria-label="Paused">
          <div className="pause-card">
            <div className="pause-emoji">⏸️</div>
            <h2>Game paused</h2>
            <p className="pause-sub">Do you want to keep playing or return to the menu?</p>
            <div className="pause-actions">
              <button className="btn-primary big" onClick={() => setPaused(false)}>
                ▶ Keep Playing
              </button>
              <button
                className="btn-danger big pause-quit"
                onClick={() => {
                  setPaused(false);
                  onQuit();
                }}
              >
                ← Return to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
