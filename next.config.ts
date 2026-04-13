import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable instrumentation to start the bot with the server
  instrumentationHook: true,

  // Keep discord.js and related packages as external (server-side only)
  serverExternalPackages: ['discord.js', '@prisma/client'],
};

export default nextConfig;
