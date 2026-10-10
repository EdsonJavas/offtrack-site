import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Painel local (sem Blob): as fotos vão no próprio formulário.
  experimental: { serverActions: { bodySizeLimit: "20mb" } },
  images: {
    remotePatterns: [
      // Fotos cadastradas no painel (Vercel Blob).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Catálogo de exemplo (some quando o dono cadastra a primeira peça).
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-*" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
