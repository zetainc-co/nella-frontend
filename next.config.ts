import type { NextConfig } from "next";
import path from "path";

// Raíz del frontend (donde está este next.config) para que tailwindcss resuelva bien
const frontendRoot = path.resolve(process.cwd());

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  // Proxear socket.io y API routes al backend
  async rewrites() {
    return [
      {
        // Handshake raíz de socket.io (sin path), ej: /socket.io?EIO=4&transport=polling
        source: "/socket.io",
        destination: `${BACKEND_URL}/socket.io`,
      },
      {
        // Cualquier subruta de socket.io (fallback)
        source: "/socket.io/:path*",
        destination: `${BACKEND_URL}/socket.io/:path*`,
      },
      {
        source: "/chatwoot-conversations/:path*",
        destination: `${BACKEND_URL}/chatwoot-conversations/:path*`,
      },
      // NOTA: No proxear /api/* a NestJS — esas rutas son Next.js API Route Handlers.
      // NestJS no tiene prefijo /api/. Sus rutas son: /auth, /dify, /chatwoot, /booking, etc.
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
