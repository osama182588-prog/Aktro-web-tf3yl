import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep discord.js and related packages as external (server-side only)
  serverExternalPackages: ['discord.js', '@prisma/client'],
};

export default nextConfig;
