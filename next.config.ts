import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Empêche le bundling du moteur Prisma (nécessaire au déploiement Vercel)
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
