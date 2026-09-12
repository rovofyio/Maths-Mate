import { signal } from "@preact/signals";
import { useState } from "preact/hooks";
import { lazy, Suspense } from "preact/compat";
import { state } from "./lib/store";
import { levelForXp } from "./lib/storage";
import { toastSignal } from "./lib/toast";
import auraLogoUrl from "../Pictures/AuraWithNameCropped.png";
import { SupportModal } from "./components/SupportModal";
import { UpdateBanner } from "./components/UpdateBanner";
import type { Route } from "./types";

// Code-split by tab so low-memory devices only parse/hold the JS for the
// screen in use (games list stays light; heavy screens load on demand).
const GameHome = lazy(() => import("./screens/GameHome").then((m) => ({ default: m.GameHome })));
const LearnScreen = lazy(() => import("./screens/LearnScreen").then((m) => ({ default: m.LearnScreen })));
const DailyScreen = lazy(() => import("./screens/DailyScreen").then((m) => ({ default: m.DailyScreen })));
const ProfileScreen = lazy(() => import("./screens/ProfileScreen").then((m) => ({ default: m.ProfileScreen })));
const ShopScreen = lazy(() => import("./screens/ShopScreen").then((m) => ({ default: m.ShopScreen })));
const SettingsScreen = lazy(() => import("./screens/SettingsScreen").then((m) => ({ default: m.SettingsScreen })));

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
  const [showSupport, setShowSupport] = useState(false);

  const nav = [
    { name: "games" as const, label: "Games", icon: "🎮" },
    { name: "learn" as const, label: "Learn", icon: "📚" },
    { name: "daily" as const, label: "Daily", icon: "🎡" },
    { name: "profile" as const, label: "Profile", icon: "👤" },
    { name: "shop" as const, label: "Shop", icon: "💎" },
    { name: "settings" as const, label: "Settings", icon: "⚙️" },
  ];

  return (
    <div id="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <img src={auraLogoUrl} alt="Maths Aura" className="brand-logo" draggable={false} />
          </div>
<div className="topbar-stats">
               <a className="stat-chip" onClick={() => setShowSupport(true)} title="Support Math Aura" style={{ cursor: "pointer" }}>💎 Support</a>
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
        <Suspense fallback={<div className="page"><p className="muted">Loading…</p></div>}>
         {route.name === "games" && <GameHome />}
         {route.name === "learn" && <LearnScreen />}
         {route.name === "daily" && <DailyScreen />}
         {route.name === "profile" && <ProfileScreen />}
         {route.name === "shop" && <ShopScreen />}
         {route.name === "settings" && <SettingsScreen />}
        </Suspense>
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
      <UpdateBanner />
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
    </div>
  );
}