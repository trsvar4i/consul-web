import type { NextConfig } from "next";

// Go backend (arcanum-api). In dev the rewrite keeps cookies same-origin.
const API_URL = process.env.API_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${API_URL}/api/v1/:path*` }];
  },
};

export default nextConfig;
