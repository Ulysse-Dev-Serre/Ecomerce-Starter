import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,   // laisse si tu veux que Vercel ne bloque pas sur les erreurs ESLint
  },
  typescript: {
    ignoreBuildErrors: false,   // laisse à "false" pour bloquer sur erreurs TS (bon réflexe)
  },
  turbopack: {
    // Tu peux mettre des options ici si besoin,
    // mais en général on laisse vide car Next gère déjà les extensions.
  },
};

export default nextConfig;
