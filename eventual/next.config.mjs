/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Esto está bien
    eslint: {
      ignoreDuringBuilds: true, // Ignorar ESLint durante el build
    },
  };
  
  export default nextConfig;
  