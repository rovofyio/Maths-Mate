import { useState } from "preact/hooks";
import { state, resetAll, updateSettings } from "../lib/store";
import { showToast } from "../lib/toast";
import { setTheme, setPowerMode } from "../lib/settings";
import { startMusic, stopMusic } from "../lib/music";
import { getDeviceCaps, isPowerSaverActive } from "../lib/perf";
import {
  connectFacebook,
  connectGoogle,
  disconnectFacebook,
  disconnectGoogle,
  getSocialIds,
  saveSocialIds,
  SocialSetupError,
} from "../lib/social";

export function SettingsScreen() {
  const s = state.value;
  const cfg = s.settings;
  const caps = getDeviceCaps();
  const saverOn = isPowerSaverActive();
  const [busy, setBusy] = useState<null | "google" | "facebook">(null);
  const [showIds, setShowIds] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(() => getSocialIds().googleClientId);
  const [facebookAppId, setFacebookAppId] = useState(() => getSocialIds().facebookAppId);

  const errorMsg = (e: unknown, fallback: string): string =>
    e instanceof Error && e.message ? e.message : fallback;

  async function handleGoogle() {
    if (busy) return;
    // Disconnect: revoke the Google token, then clear local state.
    if (cfg.googlePlay) {
      setBusy("google");
      try {
        await disconnectGoogle();
      } catch {
        /* best effort */
      }
      updateSettings({ googlePlay: false, googleName: undefined });
      setBusy(null);
      showToast("Disconnected from Google Play");
      return;
    }
    // Connect: real Google sign-in popup via Google Identity Services.
    setBusy("google");
    try {
      const profile = await connectGoogle();
      updateSettings({ googlePlay: true, googleName: profile.name });
      showToast(`✅ Connected as ${profile.name}`);
    } catch (e) {
      if (e instanceof SocialSetupError) {
        setShowIds(true);
        showToast("Paste your Google Client ID below to connect");
      } else {
        showToast(`Google sign-in failed: ${errorMsg(e, "unknown error")}`);
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleFacebook() {
    if (busy) return;
    // Disconnect: log out of Facebook, then clear local state.
    if (cfg.facebook) {
      setBusy("facebook");
      try {
        await disconnectFacebook();
      } catch {
        /* best effort */
      }
      updateSettings({ facebook: false, facebookName: undefined });
      setBusy(null);
      showToast("Disconnected from Facebook");
      return;
    }
    // Connect: real Facebook Login dialog via the Facebook SDK.
    setBusy("facebook");
    try {
      const profile = await connectFacebook();
      updateSettings({ facebook: true, facebookName: profile.name });
      showToast(`✅ Connected as ${profile.name}`);
    } catch (e) {
      if (e instanceof SocialSetupError) {
        setShowIds(true);
        showToast("Paste your Facebook App ID below to connect");
      } else {
        showToast(`Facebook sign-in failed: ${errorMsg(e, "unknown error")}`);
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="page">
      <div className="games-head">
        <h1 className="page-title">⚙️ Settings</h1>
      </div>

      <div className="settings-list">
        <h2 className="section-title no-margin">🔗 Accounts</h2>
        <div className="setting-row">
          <div className="setting-info">
            <span className="setting-icon">▶️</span>
            <div>
              <div className="setting-name">Google Play Games</div>
              <div className="setting-desc">
                {cfg.googlePlay
                  ? cfg.googleName
                    ? `Connected as ${cfg.googleName}`
                    : "Connected"
                  : "Sync achievements and leaderboards"}
              </div>
            </div>
          </div>
          <button
            className={cfg.googlePlay ? "btn-ghost connected-btn" : "btn-buy"}
            disabled={busy !== null}
            onClick={handleGoogle}
          >
            {busy === "google" ? "…" : cfg.googlePlay ? "✓ Connected" : "Connect"}
          </button>
        </div>
        <div className="setting-row">
          <div className="setting-info">
            <span className="setting-icon">📘</span>
            <div>
              <div className="setting-name">Facebook</div>
              <div className="setting-desc">
                {cfg.facebook
                  ? cfg.facebookName
                    ? `Connected as ${cfg.facebookName}`
                    : "Connected"
                  : "Share scores with friends"}
              </div>
            </div>
          </div>
          <button
            className={cfg.facebook ? "btn-ghost connected-btn" : "btn-buy"}
            disabled={busy !== null}
            onClick={handleFacebook}
          >
            {busy === "facebook" ? "…" : cfg.facebook ? "✓ Connected" : "Connect"}
          </button>
        </div>
        {showIds && (
          <div className="setting-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
            <div>
              <div className="setting-name">🔑 App credentials</div>
              <div className="setting-desc">Needed once so the buttons can open the real sign-in. Stored only on this device.</div>
            </div>
            <label className="setting-desc" htmlFor="google-client-id">Google Client ID</label>
            <input
              id="google-client-id"
              className="pvp-age-input"
              style={{ width: "100%", textAlign: "left" }}
              placeholder="123456… .apps.googleusercontent.com"
              value={googleClientId}
              onInput={(e) => setGoogleClientId((e.target as HTMLInputElement).value)}
            />
            <label className="setting-desc" htmlFor="facebook-app-id">Facebook App ID</label>
            <input
              id="facebook-app-id"
              className="pvp-age-input"
              style={{ width: "100%", textAlign: "left" }}
              placeholder="e.g. 123456789012345"
              value={facebookAppId}
              onInput={(e) => setFacebookAppId((e.target as HTMLInputElement).value)}
            />
            <button
              className="btn-primary"
              onClick={() => {
                saveSocialIds({ googleClientId, facebookAppId });
                setShowIds(false);
                showToast("Credentials saved — tap Connect again");
              }}
            >
              Save
            </button>
          </div>
        )}

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

        <h2 className="section-title no-margin">⚡ Performance</h2>
        <div className="setting-row">
          <div className="setting-info">
            <span className="setting-icon">{saverOn ? "🔋" : "🚀"}</span>
            <div>
              <div className="setting-name">Power saver {saverOn ? "(on)" : "(off)"}</div>
              <div className="setting-desc">
                {cfg.powerMode === "auto"
                  ? caps.lowEnd
                    ? `Auto: low-power device detected${caps.reason ? ` (${caps.reason})` : ""} — effects reduced`
                    : "Auto: full effects (device looks capable)"
                  : cfg.powerMode === "saver"
                    ? "On: fewer animations, less battery & memory use"
                    : "Off: full effects"}
              </div>
            </div>
          </div>
          <div className="segmented">
            <button className={`segment ${cfg.powerMode === "auto" ? "active" : ""}`} onClick={() => { setPowerMode("auto"); showToast("Performance: Auto"); }}>
              Auto
            </button>
            <button className={`segment ${cfg.powerMode === "full" ? "active" : ""}`} onClick={() => { setPowerMode("full"); showToast("Performance: Full effects"); }}>
              Full
            </button>
            <button className={`segment ${cfg.powerMode === "saver" ? "active" : ""}`} onClick={() => { setPowerMode("saver"); showToast("🔋 Power saver on"); }}>
              Saver
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
    </div>
  );
}
