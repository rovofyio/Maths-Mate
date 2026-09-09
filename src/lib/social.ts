/**
 * Real social sign-in for Math Aura.
 *
 * Methods used (official SDKs, loaded lazily so low-end devices pay nothing
 * until the user actually taps Connect):
 *  - Google: Google Identity Services OAuth2 token flow (accounts.google.com/gsi/client)
 *  - Facebook: Facebook JS SDK Login (connect.facebook.net SDK + FB.login)
 *
 * Both need app credentials, read from `VITE_GOOGLE_CLIENT_ID` /
 * `VITE_FACEBOOK_APP_ID` at build time or pasted in Settings → Accounts
 * (stored locally on device). How to get them:
 *  - Google: Google Cloud Console → APIs & Services → Credentials → create an
 *    OAuth 2.0 Client ID (type "Web application") and add your origin
 *    (e.g. http://localhost:5173 for dev, your domain for prod, and
 *    https://localhost for the Capacitor Android build) under
 *    "Authorized JavaScript origins".
 *  - Facebook: developers.facebook.com → create an app → copy the App ID,
 *    add Facebook Login product, and allow your domain in app settings.
 */

export interface SocialProfile {
  name: string;
  email?: string;
}

export interface SocialIds {
  googleClientId: string;
  facebookAppId: string;
}

/** Thrown when the user must supply an app credential before connecting. */
export class SocialSetupError extends Error {
  provider: "google" | "facebook";
  constructor(provider: "google" | "facebook") {
    super(provider === "google" ? "Google Client ID is not set." : "Facebook App ID is not set.");
    this.name = "SocialSetupError";
    this.provider = provider;
  }
}

const IDS_KEY = "mathaura-social-ids";
const GOOGLE_TOKEN_KEY = "mathaura-google-token";

function readEnv(name: string): string {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return env?.[name] ?? "";
  } catch {
    return "";
  }
}

export function getSocialIds(): SocialIds {
  let stored: Partial<SocialIds> = {};
  try {
    const raw = localStorage.getItem(IDS_KEY);
    if (raw) stored = JSON.parse(raw) as Partial<SocialIds>;
  } catch {
    /* ignore — fall through to env/defaults */
  }
  return {
    googleClientId: readEnv("VITE_GOOGLE_CLIENT_ID") || stored.googleClientId || "",
    facebookAppId: readEnv("VITE_FACEBOOK_APP_ID") || stored.facebookAppId || "",
  };
}

export function saveSocialIds(ids: SocialIds): void {
  try {
    localStorage.setItem(
      IDS_KEY,
      JSON.stringify({ googleClientId: ids.googleClientId.trim(), facebookAppId: ids.facebookAppId.trim() })
    );
  } catch {
    /* storage unavailable (private mode etc.) */
  }
}

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (document.getElementById(id)) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.id = id;
      s.src = src;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Could not load sign-in library (${src}). Check your connection.`));
      document.head.appendChild(s);
    } catch (e) {
      reject(e);
    }
  });
}

// ── Google ────────────────────────────────────────────────────────────────

interface GoogleAccounts {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (resp: { access_token?: string; error?: string }) => void;
      error_callback?: (err: { message?: string }) => void;
    }) => { requestAccessToken: () => void };
    revoke: (token: string, done: () => void) => void;
  };
}

async function getGoogleAccounts(): Promise<GoogleAccounts> {
  await loadScript("https://accounts.google.com/gsi/client", "google-gsi");
  const accounts = (window as unknown as { google?: { accounts?: GoogleAccounts } }).google?.accounts;
  if (!accounts) throw new Error("Google sign-in library failed to start.");
  return accounts;
}

/** Real Google sign-in: OAuth popup → access token → profile name/email. */
export async function connectGoogle(): Promise<SocialProfile> {
  const { googleClientId } = getSocialIds();
  if (!googleClientId) throw new SocialSetupError("google");
  const accounts = await getGoogleAccounts();

  const token: string = await new Promise((resolve, reject) => {
    try {
      const client = accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: "email profile",
        callback: (resp) => {
          if (resp?.access_token) resolve(resp.access_token);
          else reject(new Error(resp?.error === "popup_closed" ? "Google sign-in was cancelled." : "Google sign-in failed."));
        },
        error_callback: (err) => reject(new Error(err?.message || "Google sign-in failed.")),
      });
      client.requestAccessToken();
    } catch (e) {
      reject(e instanceof Error ? e : new Error("Google sign-in failed."));
    }
  });

  // Keep the token for the session only (revoked on disconnect).
  try {
    sessionStorage.setItem(GOOGLE_TOKEN_KEY, token);
  } catch {
    /* ignore */
  }

  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Signed in, but Google would not share the profile.");
  const info = (await res.json()) as { name?: string; email?: string };
  return { name: info.name || info.email || "Google user", email: info.email };
}

export async function disconnectGoogle(): Promise<void> {
  let token: string | null = null;
  try {
    token = sessionStorage.getItem(GOOGLE_TOKEN_KEY);
    sessionStorage.removeItem(GOOGLE_TOKEN_KEY);
  } catch {
    /* ignore */
  }
  if (token) {
    try {
      const accounts = (window as unknown as { google?: { accounts?: GoogleAccounts } }).google?.accounts;
      if (accounts) {
        await new Promise<void>((resolve) => {
          try {
            accounts.oauth2.revoke(token as string, () => resolve());
          } catch {
            resolve();
          }
        });
        return;
      }
      await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, { method: "POST" }).catch(
        () => {}
      );
    } catch {
      /* best effort — local state is cleared regardless */
    }
  }
}

// ── Facebook ──────────────────────────────────────────────────────────────

interface FBSDK {
  init: (opts: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
  login: (cb: (resp: { authResponse?: unknown }) => void, opts?: { scope?: string }) => void;
  logout: (cb: () => void) => void;
  api: (path: string, params: Record<string, string>, cb: (resp: { name?: string; email?: string; error?: { message?: string } } | null) => void) => void;
}

declare global {
  interface Window {
    FB?: FBSDK;
    __mathauraFbAppId?: string;
  }
}

async function getFB(appId: string): Promise<FBSDK> {
  await loadScript("https://connect.facebook.net/en_US/sdk.js", "facebook-jssdk");
  const FB = window.FB;
  if (!FB) throw new Error("Facebook sign-in library failed to start.");
  // (Re-)initialise when the App ID changed.
  if (window.__mathauraFbAppId !== appId) {
    FB.init({ appId, cookie: true, xfbml: false, version: "v21.0" });
    window.__mathauraFbAppId = appId;
  }
  return FB;
}

/** Real Facebook Login: FB.login dialog → /me profile name/email. */
export async function connectFacebook(): Promise<SocialProfile> {
  const { facebookAppId } = getSocialIds();
  if (!facebookAppId) throw new SocialSetupError("facebook");
  const FB = await getFB(facebookAppId);

  await new Promise<void>((resolve, reject) => {
    try {
      FB.login(
        (resp) => {
          if (resp?.authResponse) resolve();
          else reject(new Error("Facebook sign-in was cancelled."));
        },
        { scope: "public_profile,email" }
      );
    } catch (e) {
      reject(e instanceof Error ? e : new Error("Facebook sign-in failed."));
    }
  });

  const me = await new Promise<{ name?: string; email?: string }>((resolve, reject) => {
    try {
      FB.api("/me", { fields: "name,email" }, (resp) => {
        if (resp && !resp.error) resolve(resp);
        else reject(new Error(resp?.error?.message || "Signed in, but Facebook would not share the profile."));
      });
    } catch (e) {
      reject(e instanceof Error ? e : new Error("Could not read Facebook profile."));
    }
  });
  return { name: me.name || "Facebook user", email: me.email };
}

export async function disconnectFacebook(): Promise<void> {
  try {
    const FB = window.FB;
    if (FB) {
      await new Promise<void>((resolve) => {
        try {
          FB.logout(() => resolve());
        } catch {
          resolve();
        }
      });
    }
  } catch {
    /* best effort — local state is cleared regardless */
  }
}
