/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
      ignoreDuringBuilds: true, // Ignora ESLint en build
    },
    experimental: {
      appDir: true, // Para usar la estructura `app`
    },
    async redirects() {
      return [
        {
          source: "/",
          destination: "/home",
          permanent: true,
        },
      ];
    },
  };
  
  export default nextConfig;
  