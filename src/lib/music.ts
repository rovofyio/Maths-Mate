let audio: HTMLAudioElement | null = null;

function ensureAudio(): HTMLAudioElement | null {
  if (!audio) {
    try {
      audio = new Audio("audio/MenuMusic.mp3");
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0.45;
    } catch {
      return null;
    }
  }
  return audio;
}

export function startMusic(): void {
  const a = ensureAudio();
  if (!a || !a.paused) return;
  a.play().catch(() => {});
}

export function stopMusic(): void {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}
