import { useState } from "preact/hooks";
import { state, resetAll, updateSettings } from "../lib/store";
import { levelProgress } from "../lib/storage";
import { totalLessons } from "../data/chapters";
import { accuracy as calcAccuracy } from "../games/helpers";
import { ACHIEVEMENTS } from "../lib/achievements";
import { allScores, GAME_NAMES, totalScore } from "../lib/leaderboard";
import { showToast } from "../lib/toast";
import { setTheme } from "../lib/settings";
import { startMusic, stopMusic } from "../lib/music";
import { Paywall } from "../components/Paywall";

type Tab = "stats" | "achievements" | "leaderboard" | "shop" | "settings";

export function ProfileScreen() {
  const [tab, setTab] = useState<Tab>("stats");
  const [paywall, setPaywall] = useState(false);
  const s = state.value;
  const cfg = s.settings;
  const prog = levelProgress(s.xp);
  const acc = calcAccuracy(s.correctAnswers, s.totalAnswers);
  const stats = s.topicStats;
  const scores = allScores();

  const TABS: { id: Tab; label: string }[] = [
    { id: "stats", label: "📊 Stats" },
    { id: "achievements", label: "🏆 Badges" },
    { id: "leaderboard", label: "🏅 Board" },
    { id: "shop", label: "💎 Shop" },
    { id: "settings", label: "⚙️ Settings" },
  ];

  return (
    <div className="page">
      <div className="games-head">
        <h1 className="page-title">👤 My Profile</h1>
        <button className="shop-link" onClick={() => setPaywall(true)}>
          💎 Premium
        </button>
      </div>

      <div className="profile-card">
        <div className="avatar">{s.lessonsCompleted.length >= 3 ? "🎓" : "🧒"}</div>
        <div>
          <div className="profile-name">Maths Explorer</div>
          <div className="profile-level">Level {prog.level}</div>
        </div>
        <div className="profile-coins">🪙 {s.coins}</div>
      </div>

      <div className="level-card">
        <div className="level-card-head">
          <span>⭐ {s.xp} XP</span>
          <span>Level {prog.level}</span>
        </div>
        <div className="progress-bar tall">
          <div className="progress-fill" style={{ width: `${prog.pct}%` }} />
        </div>
        <div className="level-card-foot">
          {prog.current} / {prog.need} XP to next level
        </div>
      </div>

      <div className="profile-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`profile-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <>
          <div className="stats-grid">
            <div className="stat-tile">
              <div className="stat-num">{s.gamesPlayed}</div>
              <div className="stat-label">Games</div>
            </div>
            <div className="stat-tile">
              <div className="stat-num">{s.gamesWon}</div>
              <div className="stat-label">Wins</div>
            </div>
            <div className="stat-tile">
              <div className="stat-num">{s.totalAnswers}</div>
              <div className="stat-label">Answers</div>
            </div>
            <div className="stat-tile">
              <div className={`stat-num ${acc >= 80 ? "good" : acc >= 50 ? "warn" : "bad"}`}>{acc}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div className="stat-tile">
              <div className="stat-num">
                {s.lessonsCompleted.length}/{totalLessons()}
              </div>
              <div className="stat-label">Lessons</div>
            </div>
            <div className="stat-tile">
              <div className="stat-num">{Object.keys(s.achievements).length}/{ACHIEVEMENTS.length}</div>
              <div className="stat-label">Badges</div>
            </div>
          </div>

          <h2 className="section-title">📊 Topic accuracy</h2>
          {Object.keys(stats).length === 0 ? (
            <p className="muted">Play some games to see your topic accuracy!</p>
          ) : (
            <div className="topic-stats">
              {Object.entries(stats).map(([id, t]) => {
                const pct = t.total ? Math.round((t.correct / t.total) * 100) : 0;
                return (
                  <div key={id} className="topic-stat">
                    <span className="topic-stat-name">{id}</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="topic-stat-val">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "achievements" && (
        <div className="achievements">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = !!s.achievements[a.id];
            return (
              <div key={a.id} className={`achievement ${unlocked ? "unlocked" : "locked"}`}>
                <span className="achievement-emoji">{unlocked ? a.emoji : "🔒"}</span>
                <div>
                  <div className="achievement-name">{a.name}</div>
                  <div className="achievement-desc">{a.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "leaderboard" && (
        <div className="leaderboard">
          {scores.length === 0 ? (
            <p className="muted">No scores yet — finish a game to set one!</p>
          ) : (
            <>
              <div className="leaderboard-total">
                <span className="lb-total-num">{totalScore()}</span>
                <span className="lb-total-label">total points</span>
              </div>
              {scores.map((e, i) => (
                <div key={e.gameId} className="lb-row">
                  <span className={`lb-rank ${i < 3 ? `top${i + 1}` : ""}`}>{i + 1}</span>
                  <span className="lb-game">{GAME_NAMES[e.gameId] ?? e.gameId}</span>
                  <span className="lb-score">{e.score}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === "shop" && (
        <div className="shop-intro">
          <p className="muted">The shop lets you buy coin packs and remove ads with real money — the first 5 games are always free.</p>
          <button className="btn-primary big" onClick={() => setPaywall(true)}>
            💎 Open the shop
          </button>
        </div>
      )}

      {tab === "settings" && (
        <div className="settings-list">
          <h2 className="section-title no-margin">🔗 Accounts</h2>
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-icon">▶️</span>
              <div>
                <div className="setting-name">Google Play Games</div>
                <div className="setting-desc">{cfg.googlePlay ? "Connected" : "Sync achievements and leaderboards"}</div>
              </div>
            </div>
            <button
              className={cfg.googlePlay ? "btn-ghost connected-btn" : "btn-buy"}
              onClick={() => {
                updateSettings({ googlePlay: !cfg.googlePlay });
                showToast(cfg.googlePlay ? "Disconnected from Google Play" : "✅ Connected to Google Play!");
              }}
            >
              {cfg.googlePlay ? "✓ Connected" : "Connect"}
            </button>
          </div>
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-icon">📘</span>
              <div>
                <div className="setting-name">Facebook</div>
                <div className="setting-desc">{cfg.facebook ? "Connected" : "Share scores with friends"}</div>
              </div>
            </div>
            <button
              className={cfg.facebook ? "btn-ghost connected-btn" : "btn-buy"}
              onClick={() => {
                updateSettings({ facebook: !cfg.facebook });
                showToast(cfg.facebook ? "Disconnected from Facebook" : "✅ Connected to Facebook!");
              }}
            >
              {cfg.facebook ? "✓ Connected" : "Connect"}
            </button>
          </div>

          <h2 className="section-title no-margin">🎨 Appearance</h2>
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-icon">{cfg.theme === "dark" ? "🌙" : "☀️"}</span>
              <div>
                <div className="setting-name">Theme</div>
                <div className="setting-desc">{cfg.theme === "dark" ? "Dark mode" : "Light mode"}</div>
              </div>
            </div>
            <div className="segmented">
              <button className={`segment ${cfg.theme === "light" ? "active" : ""}`} onClick={() => setTheme("light")}>
                ☀️ Light
              </button>
              <button className={`segment ${cfg.theme === "dark" ? "active" : ""}`} onClick={() => setTheme("dark")}>
                🌙 Dark
              </button>
            </div>
          </div>

          <h2 className="section-title no-margin">🔊 Audio</h2>
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-icon">{cfg.music ? "🎵" : "🔇"}</span>
              <div>
                <div className="setting-name">Music</div>
                <div className="setting-desc">{cfg.music ? "On" : "Off"}</div>
              </div>
            </div>
            <button
              className={`toggle ${cfg.music ? "on" : ""}`}
              role="switch"
              aria-checked={cfg.music}
              aria-label="Toggle music"
              onClick={() => {
                const next = !cfg.music;
                updateSettings({ music: next });
                if (next) startMusic();
                else stopMusic();
              }}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>
      )}

      <button
        className="btn-danger"
        onClick={() => {
          if (confirm("Reset all progress? This cannot be undone.")) {
            resetAll();
            showToast("Progress reset");
          }
        }}
      >
        Reset all progress
      </button>
      <p className="muted small">Progress is stored locally on this device.</p>

      {paywall && <Paywall onClose={() => setPaywall(false)} />}
    </div>
  );
}