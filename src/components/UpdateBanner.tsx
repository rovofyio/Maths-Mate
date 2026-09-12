import {
  completeUpdateAndRestart,
  updateProgressSignal,
  updateReadySignal,
} from "../lib/appUpdate";

export function UpdateBanner() {
  const ready = updateReadySignal.value;
  const progress = updateProgressSignal.value;

  if (!ready && progress == null) return null;

  return (
    <div className="update-banner" role="status" aria-live="polite">
      {ready ? (
        <>
          <span className="update-banner-text">🎉 Update ready</span>
          <button
            className="btn-primary update-banner-btn"
            onClick={() => void completeUpdateAndRestart()}
          >
            Restart
          </button>
        </>
      ) : (
        <span className="update-banner-text">
          ⬇️ Downloading update
          {progress != null ? ` ${Math.round(progress * 100)}%` : "…"}
        </span>
      )}
    </div>
  );
}
