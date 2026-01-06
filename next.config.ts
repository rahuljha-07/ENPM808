import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    useCache: true,
    serverActions: {
      allowedOrigins: ["localhost:3000", "h9q101zk-3000.use.devtunnels.ms"],
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
