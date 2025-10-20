/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config, { dev }) => {
    // Disable Webpack filesystem cache in development to avoid ENOENT rename errors
    if (dev) {
      (config as unknown as { cache: false }).cache = false;
    }
    return config;
  },
};

export default nextConfig;
