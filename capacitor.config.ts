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
};

export default config;
