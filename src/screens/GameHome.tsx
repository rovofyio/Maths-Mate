import { useState } from "preact/hooks";
import type { CSSProperties } from "preact";
import { GAMES, getGame } from "../games";
import { gameUnlocked } from "../lib/iap";
import { GameSession } from "../components/GameSession";
import { UnlockGameModal } from "../components/UnlockGameModal";

export function GameHome() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [unlockGameId, setUnlockGameId] = useState<string | null>(null);

  if (activeGame) {
    return <GameSession gameId={activeGame} onExit={() => setActiveGame(null)} />;
  }

  const pendingGame = unlockGameId ? getGame(unlockGameId) : null;

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
                else setUnlockGameId(g.id);
              }}
            >
              <div className="game-art">
                {unlocked ? g.emoji : "🔒"}
              </div>
              <div className="game-body">
                <h3>{g.name}</h3>
                <p>{g.blurb}</p>
              </div>
            </button>
          );
        })}
      </div>

      {pendingGame && (
        <UnlockGameModal
          game={pendingGame}
          onClose={() => setUnlockGameId(null)}
          onUnlocked={() => {
            const id = unlockGameId;
            setUnlockGameId(null);
            if (id) setActiveGame(id);
          }}
        />
      )}
    </div>
  );
}
