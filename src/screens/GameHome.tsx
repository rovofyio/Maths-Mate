import { useState } from "preact/hooks";
import type { CSSProperties } from "preact";
import { GAMES } from "../games";
import { gameUnlocked } from "../lib/iap";
import { GameSession } from "../components/GameSession";
import { Paywall } from "../components/Paywall";

import { showToast } from "../lib/toast";

export function GameHome() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  if (activeGame) {
    return <GameSession gameId={activeGame} onExit={() => setActiveGame(null)} />;
  }

  return (
    <div className="page">
      <div className="game-grid">
        {GAMES.map((g) => {
          const unlocked = gameUnlocked(g);
          return (
            <button
              key={g.id}
              className="game-card"
              style={{ "--acc": g.color } as CSSProperties}
              onClick={() => {
                if (unlocked) setActiveGame(g.id);
                else {
                  setPaywallOpen(true);
                  showToast("🔒 Unlock this game with Premium!");
                }
              }}
            >
              <div className="game-art">
                {unlocked ? g.emoji : "🔒"}
              </div>
              <div className="game-body">
                <h3>{g.name}</h3>
                <p>{g.blurb}</p>
                <div className="game-tags">
                  <span className="game-tag" style={{ color: g.color, background: `${g.color}1a` }}>
                    {g.free ? "Free" : "Premium"} · {g.ages[0]}-{g.ages[1]} yrs
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {paywallOpen && <Paywall onClose={() => setPaywallOpen(false)} />}
    </div>
  );
}