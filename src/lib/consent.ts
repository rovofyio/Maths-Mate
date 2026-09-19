// Cookie / GDPR consent preference.
// Shown ONCE on first app launch, then never again automatically.
// Stored in its own localStorage key so "Reset all progress" doesn't
// re-trigger the first-run popup (reset clears game state, not consent).

export type ConsentChoice = "accepted" | "rejected";

export interface ConsentRecord {
  choice: ConsentChoice;
  at: number;
}

const KEY = "maths-aura-cookie-consent-v1";

export function getConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (parsed.choice !== "accepted" && parsed.choice !== "rejected") return null;
    return { choice: parsed.choice, at: typeof parsed.at === "number" ? parsed.at : 0 };
  } catch {
    return null;
  }
}

/** True once the user has answered the first-run cookie popup (either way). */
export function hasConsented(): boolean {
  return getConsent() !== null;
}

export function setConsent(choice: ConsentChoice): ConsentRecord {
  const record: ConsentRecord = { choice, at: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    /* storage unavailable — popup will show again next launch */
  }
  return record;
}

/** Power users can re-open the popup from Settings; this clears the record. */
export function clearConsent(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
