import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mathaura.app",
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
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#7b1fa2",
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#7b1fa2",
    },
    AdMob: {
      appId: process.env.ADMOB_APP_ID || "ca-app-pub-0000000000000000~0000000000000000",
    },
  },
};

export default config;