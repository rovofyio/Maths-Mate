import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.rovofy.mathsaura",
  appName: "Math Aura",
  webDir: "dist",
  // Use https scheme for Android (required for Play Store) and allow mixed content for audio/assets
  server: {
    androidScheme: "https",
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