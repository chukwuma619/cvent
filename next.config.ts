import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/.well-known/attendance-issuer",
        destination: "/api/well-known/attendance-issuer",
      },
    ];
  },
};

export default nextConfig;
