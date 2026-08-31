import { signal } from "@preact/signals";

export const toastSignal = signal<{ msg: string; id: number } | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;

export function showToast(msg: string): void {
  toastSignal.value = { msg, id: Date.now() };
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    toastSignal.value = null;
  }, 2400);
}