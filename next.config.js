/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so one build powers both Appwrite Sites (web) and the
  // Capacitor Android APK. SEO comes from pre-rendered HTML per route.
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
