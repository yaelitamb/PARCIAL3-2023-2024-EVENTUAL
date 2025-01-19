/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
      appDir: true,
    },
    eslint: {
      ignoreDuringBuilds: true, // Ignora ESLint durante la construcción
    },
    output: "standalone",
  };
  
  export default nextConfig;
  