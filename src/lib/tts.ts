import { Capacitor } from "@capacitor/core";
import { getState } from "./store";

let nativeTts: { speak: (o: { text: string; lang: string; rate: number }) => Promise<void> } | null = null;
let nativeTtsFailed = false;

async function getNativeTts() {
  if (nativeTtsFailed) return null;
  if (!nativeTts) {
    try {
      const mod = await import("@capacitor-community/text-to-speech");
      nativeTts = { speak: mod.TextToSpeech.speak.bind(mod.TextToSpeech) };
    } catch {
      nativeTtsFailed = true;
      return null;
    }
  }
  return nativeTts;
}

export async function speak(text: string): Promise<void> {
  const settings = getState().settings;
  if (!settings.tts) return;

  if (Capacitor.isNativePlatform()) {
    const tts = await getNativeTts();
    if (tts) {
      await tts.speak({ text, lang: "en-US", rate: settings.ttsSpeed });
      return;
    }
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = settings.ttsSpeed;
    window.speechSynthesis.speak(u);
  }
}

export function stopSpeaking(): void {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}