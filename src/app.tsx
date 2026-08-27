import { signal } from "@preact/signals";
import { state } from "./lib/store";
import { levelForXp } from "./lib/storage";
import { GameHome } from "./screens/GameHome";
import { LearnScreen } from "./screens/LearnScreen";
import { DailyScreen } from "./screens/DailyScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { toastSignal } from "./lib/toast";
import type { Route } from "./types";

const activeRoute = signal<Route>({ name: "games" });

function Toast() {
  const t = toastSignal.value;
  if (!t) return null;
  return (
    <div key={t.id} className="toast show">
      {t.msg}
    </div>
  );
}

export function App() {
  const route = activeRoute.value;
  const s = state.value;

  const nav = [
    { name: "games" as const, label: "Games", icon: "🎮" },
    { name: "learn" as const, label: "Learn", icon: "📚" },
    { name: "daily" as const, label: "Daily", icon: "🎡" },
    { name: "profile" as const, label: "Profile", icon: "👤" },
  ];

  return (
    <div id="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-icon">🧮</span>
            <span className="brand-name">Math Aura</span>
          </div>
          <div className="topbar-stats">
            <div className="stat-chip" title="Coins">
              🪙 {s.coins}
            </div>
            <div className="stat-chip" title="Experience">
              ⭐ {s.xp}
            </div>
            <div className="stat-chip" title="Level">
              🏅 {levelForXp(s.xp)}
            </div>
          </div>
        </div>
      </header>

      <main className="view">
        {route.name === "games" && <GameHome />}
        {route.name === "learn" && <LearnScreen />}
        {route.name === "daily" && <DailyScreen />}
        {route.name === "profile" && <ProfileScreen />}
      </main>

      <footer>
        <nav className="bottom-nav" aria-label="Main navigation">
          {nav.map((n) => (
            <button key={n.name} className={`nav-btn ${route.name === n.name ? "active" : ""}`} onClick={() => (activeRoute.value = { name: n.name })}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>
      </footer>

      <Toast />
    </div>
  );
}