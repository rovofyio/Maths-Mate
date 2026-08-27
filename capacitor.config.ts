import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mathaura.app",
  appName: "Math Aura",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    AdMob: {
      appId: process.env.ADMOB_APP_ID || "ca-app-pub-0000000000000000~0000000000000000",
    },
  },
};

export default config;