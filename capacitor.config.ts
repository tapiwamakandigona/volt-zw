import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "me.tapiwa.voltzw",
  appName: "VoltZW",
  // Next.js static export output directory
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#0e0e14",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0e0e14",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0e0e14",
    },
  },
};

export default config;
