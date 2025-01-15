import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';
const repoName = 'Space-Swap'; // Replace with your actual repository name

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  ...(isProduction && {
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}`,
  }),
};

export default nextConfig;
