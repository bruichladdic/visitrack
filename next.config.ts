import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pas de "output: standalone" : inutile sur Vercel et casse le packaging
  // des fonctions serverless. Le sandbox local utilise `next dev`.
  // Empêche le bundling du moteur Prisma (nécessaire au déploiement Vercel)
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
