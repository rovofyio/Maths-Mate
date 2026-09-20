// Global age verification — shown ONCE on first app launch, then never again.
// Stored in its own localStorage key so "Reset all progress" doesn't
// re-trigger the first-run popup (reset clears game state, not verification).

export interface AgeVerificationRecord {
  age: number;
  at: number;
}

const KEY = "maths-aura-age-verified-v1";
// Legacy key used by the Monster PvP arena gate — kept in sync for backward compat.
const LEGACY_PVP_KEY = "pvp-age";

function parseAge(value: unknown): number | null {
  const n = typeof value === "string" ? parseInt(value, 10) : typeof value === "number" ? value : NaN;
  if (!Number.isInteger(n) || n < 1 || n > 99) return null;
  return n;
}

export function getAgeVerification(): AgeVerificationRecord | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AgeVerificationRecord>;
      const age = parseAge(parsed.age);
      if (age !== null) return { age, at: typeof parsed.at === "number" ? parsed.at : 0 };
    }
    // Migrate legacy PvP age so returning users are not asked again.
    const legacy = localStorage.getItem(LEGACY_PVP_KEY);
    const migrated = parseAge(legacy);
    if (migrated !== null) {
      const record: AgeVerificationRecord = { age: migrated, at: Date.now() };
      try {
        localStorage.setItem(KEY, JSON.stringify(record));
      } catch {
        /* ignore */
      }
      return record;
    }
    return null;
  } catch {
    return null;
  }
}

/** True once the user has completed the first-run age check. */
export function hasVerifiedAge(): boolean {
  return getAgeVerification() !== null;
}

export function setAgeVerification(age: number): AgeVerificationRecord | null {
  const valid = parseAge(age);
  if (valid === null) return null;
  const record: AgeVerificationRecord = { age: valid, at: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    /* storage unavailable — popup will show again next launch */
  }
  try {
    localStorage.setItem(LEGACY_PVP_KEY, String(valid));
  } catch {
    /* ignore */
  }
  return record;
}

/** Power users can re-verify from Settings; this clears the record. */
export function clearAgeVerification(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
