import type { NextConfig } from "next";
import path from "path";

// Raíz del frontend (donde está este next.config) para que tailwindcss resuelva bien
const frontendRoot = path.resolve(process.cwd());

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  // Proxear socket.io al backend para evitar bloqueos de ad-blockers (same-origin)
  async rewrites() {
    return [
      {
        source: "/socket.io/:path*",
        destination: `${BACKEND_URL}/socket.io/:path*`,
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      tailwindcss: path.join(frontendRoot, "node_modules", "tailwindcss"),
    },
  },
  webpack: (config) => {
    config.resolve.context = frontendRoot;
    config.resolve.alias = {
      ...config.resolve.alias,
      tailwindcss: path.join(frontendRoot, "node_modules", "tailwindcss"),
    };
    return config;
  },
};

export default nextConfig;
