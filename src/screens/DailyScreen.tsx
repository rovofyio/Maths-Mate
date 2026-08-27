import { useState } from "preact/hooks";
import { spinWheel, SPIN_PRIZES } from "../lib/spinner";
import { claimDailySpin, canSpinToday } from "../lib/store";
import { evaluateAfterGame } from "../lib/achievements";
import { showToast } from "../lib/toast";

export function DailyScreen() {
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState<{ coins: number; xp: number; label: string } | null>(null);
  
  const canSpin = canSpinToday();

  const spin = () => {
    if (!canSpin || spinning) return;
    setSpinning(true);
    setPrize(null);
    setTimeout(() => {
      const result = spinWheel();
      const claimed = claimDailySpin(result);
      setPrize(result);
      setSpinning(false);
      if (claimed) {
        showToast(`🎡 ${result.label}!`);
        evaluateAfterGame({ gameId: "spin", won: true, correct: 1, total: 1, bestStreak: 0, score: result.coins, coins: result.coins, xp: result.xp });
      }
    }, 1800);
  };

  const seg = 360 / SPIN_PRIZES.length;

  return (
    <div className="page">
      <h1 className="page-title">🎡 Daily Wheel</h1>
      <p className="page-sub">Spin once a day for bonus coins and XP!</p>

      <div className="wheel-wrap">
        <div
          className={`wheel ${spinning ? "spinning" : ""}`}
          style={{
            background: `conic-gradient(${SPIN_PRIZES.map((_p, i) => `${i % 2 === 0 ? "#7b1fa2" : "#ab47bc"} ${i * seg}deg ${(i + 1) * seg}deg`).join(",")})`,
          }}
        >
          <div className="wheel-center">🎯</div>
        </div>
        <div className="wheel-pointer" />
      </div>

      <div className="wheel-prizes">
        {SPIN_PRIZES.map((p) => (
          <span key={p.label} className="wheel-prize-tag">
            {p.coins > 0 ? `🪙${p.coins}` : `⭐${p.xp}`}
          </span>
        ))}
      </div>

      {prize ? (
        <div className="spin-result">
          <div className="spin-result-emoji">{prize.coins >= 500 ? "🎉" : "🪙"}</div>
          <h3>You won: {prize.label}</h3>
          <p className="page-sub">Come back tomorrow for another spin!</p>
        </div>
      ) : (
        <button className="btn-primary big" onClick={spin} disabled={!canSpin || spinning}>
          {spinning ? "Spinning..." : canSpin ? "🔄 Spin the wheel" : "⏳ Come back tomorrow"}
        </button>
      )}

      <div className="games-tip">
        <span>📅</span>
        <div>
          <strong>Daily rewards:</strong> a fresh spin every day builds your coin stash for the shop and boosts your level.
        </div>
      </div>
    </div>
  );
}