import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // instrumentation.ts guards Node-only code with NEXT_RUNTIME at runtime, but
  // webpack still resolves the import when it builds the edge instrumentation
  // entry (in dev it always builds one). That layer drops node resolve
  // conditions, so `pg` lands on its ESM build and `require('fs')` fails.
  // Nothing here is reachable on edge, so point it at an empty module.
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === "edge") {
      // Keyed by resolved path: instrumentation imports it as "./lib/superadmin",
      // and webpack matches aliases against the specifier as written.
      config.resolve.alias[path.resolve("src/lib/superadmin")] = false;
    }
    return config;
  },
  experimental: {
    // Development fetches must reflect the code/data currently on disk.
    // Next otherwise reuses Server Component responses across HMR updates.
    serverComponentsHmrCache: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "omsonslabs.com",
      },
    ],
  },
};

export default nextConfig;
