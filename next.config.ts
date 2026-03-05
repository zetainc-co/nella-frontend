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
        source: "/socket.io/:path*",
        destination: `${BACKEND_URL}/socket.io/:path*`,
      },
      {
        source: "/chat/:path*",
        destination: `${BACKEND_URL}/chat/:path*`,
      },
      {
        source: "/conversations/:path*",
        destination: `${BACKEND_URL}/conversations/:path*`,
      },
      {
        source: "/messages/:path*",
        destination: `${BACKEND_URL}/messages/:path*`,
      },
      {
        source: "/labels/:path*",
        destination: `${BACKEND_URL}/labels/:path*`,
      },
      {
        source: "/inboxes/:path*",
        destination: `${BACKEND_URL}/inboxes/:path*`,
      },
      {
        source: "/assignments/:path*",
        destination: `${BACKEND_URL}/assignments/:path*`,
      },
      {
        source: "/users/:path*",
        destination: `${BACKEND_URL}/users/:path*`,
      },
      {
        source: "/chatwoot-conversations/:path*",
        destination: `${BACKEND_URL}/chatwoot-conversations/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
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
