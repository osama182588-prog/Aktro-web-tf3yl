import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إعدادات Next.js
  typescript: {
    // تجاهل أخطاء TypeScript في البناء (للمشاريع قيد التطوير)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
