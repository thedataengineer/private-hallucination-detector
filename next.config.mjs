/** @type {import('next').NextConfig} */

const nextConfig = {
    basePath: "/hallucination-detector",
    experimental: {
      serverActions: {
        allowedOrigins: ["localhost:3000", "127.0.0.1:3000"],
        allowedForwardedHosts: ["localhost:3000", "127.0.0.1:3000"],
      },
    },
  };
  
export default nextConfig;
