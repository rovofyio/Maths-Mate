import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.rovofy.mathsaura",
  appName: "Math Aura",
  webDir: "dist",
  // Default http scheme: Capacitor serves bundled files locally via
  // http://localhost (loopback — exempt from cleartext bans and treated as
  // a secure context). The https scheme breaks startup with
  // net::ERR_CONNECTION_REFUSED on older System WebViews / emulator images,
  // and Play Store does not require the *local* WebView origin to be https
  // (it only cares about targetSdk + real network traffic, which stays https).
  server: {
    androidScheme: "http",
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#fdf7ff",
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#fdf7ff",
  },
  plugins: {
    // NOTE: SplashScreen/StatusBar keys removed — those @capacitor plugins are
    // not installed, and stale keys only add confusion on native startup.
    // Native splash is handled by androidx.core splashscreen + styles.xml.
    AdMob: {
      // Google test App ID (safe for debug, never crashes GMS).
      // Override at build time with ADMOB_APP_ID env var for release.
      appId: process.env.ADMOB_APP_ID || "ca-app-pub-3940256099942544~3347511713",
    },
  },
};

export default config;