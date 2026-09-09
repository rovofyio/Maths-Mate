let audio: HTMLAudioElement | null = null;

function powerSaverOn(): boolean {
  try {
    return (
      typeof document !== "undefined" &&
      (document.documentElement.dataset.power === "saver" ||
        document.documentElement.classList.contains("power-saver"))
    );
  } catch {
    return false;
  }
}

function ensureAudio(): HTMLAudioElement | null {
  if (!audio) {
    try {
      audio = new Audio("audio/MenuMusic.mp3");
      audio.loop = true;
      // Low-power devices: don't fetch/decode audio until playback is
      // actually requested — saves memory, CPU and mobile data.
      audio.preload = powerSaverOn() ? "none" : "auto";
      audio.volume = 0.45;
    } catch {
      return null;
    }
  }
  return audio;
}

/** Free the underlying media resource so nothing plays in the background and no memory is held. */
function releaseAudio(): void {
  if (!audio) return;
  try {
    audio.pause();
  } catch {
    /* ignore */
  }
  try {
    audio.removeAttribute("src");
    audio.load();
  } catch {
    /* ignore */
  }
  audio = null;
}

export function startMusic(): void {
  // Never start playback while the app is hidden / in the background (sleep mode).
  try {
    if (typeof document !== "undefined" && document.hidden) return;
  } catch {
    /* ignore */
  }
  const a = ensureAudio();
  if (!a || !a.paused) return;
  a.play().catch(() => {});
}

export function stopMusic(): void {
  releaseAudio();
}

/** Enter sleep: stop playback and release memory. Same as stopMusic, kept as a named alias. */
export function suspendMusic(): void {
  releaseAudio();
}

export function isMusicPlaying(): boolean {
  return !!audio && !audio.paused;
}
