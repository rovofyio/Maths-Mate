import { render } from "preact";
import { App } from "./app";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { initTheme } from "./lib/settings";
import { getState } from "./lib/store";
import { startMusic } from "./lib/music";
import "./styles.css";

initTheme();
render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  document.getElementById("app")!
);

const resumeMusic = () => {
  window.removeEventListener("pointerdown", resumeMusic);
  if (getState().settings.music) startMusic();
};
window.addEventListener("pointerdown", resumeMusic);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}