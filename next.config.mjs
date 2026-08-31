/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.cloudinary.com" },
      { protocol: "https", hostname: "xkqahftdjgkwncgrdkhc.supabase.co" },
    ],
  },
  async redirects() {
    return [
      { source: "/home2", destination: "/", permanent: true },
      { source: "/home2/:path*", destination: "/", permanent: true },
      { source: "/products", destination: "/products2", permanent: false },
      { source: "/products/:category", destination: "/products2/:category", permanent: false },
      { source: "/product/:slug", destination: "/product2/:slug", permanent: false },
    ];
  },
};

export default nextConfig;
