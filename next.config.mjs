/** @type {import('next').NextConfig} */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  images: {
    remotePatterns: [
      // Supabase Storage CDN — for our renamed images
      ...(supabaseHost
        ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
      // Google user-content (only used if we ever render a raw GMB URL — should be rare after the rename step)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "lh4.googleusercontent.com" },
      { protocol: "https", hostname: "lh5.googleusercontent.com" },
      { protocol: "https", hostname: "lh6.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Note: experimental.typedRoutes was removed because our Link hrefs are
  // generated at runtime (e.g. /vic/richmond/...) and can't be statically validated.
};

export default nextConfig;
