import { useEffect, useState } from "preact/hooks";
import { shouldAdGate, showInterstitial } from "../lib/ads";
import { recordAdSeen } from "../lib/store";
import { accuracy } from "../games/helpers";
import type { GameResult } from "../types";

export function GameResult({
  result,
  newAchievements,
  onReplay,
  onExit,
}: {
  result: GameResult;
  newAchievements: string[];
  onReplay: () => void;
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<"ad" | "result">(() => (shouldAdGate() ? "ad" : "result"));
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (phase !== "ad") return;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    (async () => {
      const real = await showInterstitial();
      if (cancelled) return;
      if (real) {
        recordAdSeen();
        setPhase("result");
        return;
      }
      recordAdSeen();
      interval = setInterval(() => {
        setCount((c) => {
          if (c <= 1) {
            setPhase("result");
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    })();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [phase]);

  if (phase === "ad") {
    return (
      <div className="result-overlay">
        <div className="ad-modal">
          <div className="ad-badge">AD</div>
          <div className="ad-emoji">📺</div>
          <p>Maths tip: did you know the square of 9 is 81?</p>
          <div className="ad-count">continue in {count}s</div>
        </div>
      </div>
    );
  }

  const acc = accuracy(result.correct, result.total);
  return (
    <div className="result-overlay">
      <div className={`result-card ${result.won ? "win" : "lose"}`}>
        <div className="result-emoji">{result.won ? "🎉" : "😅"}</div>
        <h2>{result.won ? "Well done!" : "Good try!"}</h2>
        <div className="result-stats">
          <div className="result-stat">
            <span className="rs-num">{result.correct}/{result.total}</span>
            <span className="rs-label">Correct</span>
          </div>
          <div className="result-stat">
            <span className="rs-num">{acc}%</span>
            <span className="rs-label">Accuracy</span>
          </div>
          <div className="result-stat">
            <span className="rs-num">+{result.coins} 🪙</span>
            <span className="rs-label">Coins</span>
          </div>
        </div>
        <div className="result-xp">+{result.xp} XP earned</div>
        {newAchievements.length > 0 && (
          <div className="result-achievements">
            <div className="ra-title">Achievement unlocked!</div>
            <div className="ra-emojis">{newAchievements.join(" ")}</div>
          </div>
        )}
        <div className="result-actions">
          <button className="btn-primary" onClick={onReplay}>
            🔁 Play again
          </button>
          <button className="btn-ghost" onClick={onExit}>
            Back to games
          </button>
        </div>
      </div>
    </div>
  );
}