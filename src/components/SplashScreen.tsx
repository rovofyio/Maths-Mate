import rovofyLogoUrl from "../../Pictures/RovofyLogo.png";

// Unity-style boot splash: shows on every app start, fades in once,
// then App unmounts it after SPLASH_MS (<= 1.5s). Keep the visuals
// in sync with SPLASH_MS in app.tsx and the splash keyframes in styles.css.
export function SplashScreen() {
  return (
    <div className="splash-overlay" role="status" aria-label="Made with love from Rovofy">
      <div className="splash-inner">
        <p className="splash-text">Made with Love from</p>
        <img src={rovofyLogoUrl} alt="Rovofy" className="splash-logo" draggable={false} />
      </div>
    </div>
  );
}
