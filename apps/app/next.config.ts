import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone" — uncomment before Docker builds (Phase 10)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
