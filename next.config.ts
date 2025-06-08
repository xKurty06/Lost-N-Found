import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upsrlhtyromblzrnkhar.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/item-images/**",
      },
    ],
  },
};

export default nextConfig;
