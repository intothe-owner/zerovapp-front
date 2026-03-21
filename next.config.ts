import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "syconsulting-bucket.s3.ap-northeast-2.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
