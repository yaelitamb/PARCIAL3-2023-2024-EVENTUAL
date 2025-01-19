/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      // Elimina 'appDir' si está presente
    },
    reactStrictMode: true, // Si no está, inclúyelo
    swcMinify: true,       // Si no está, inclúyelo
    eslint: {
        ignoreDuringBuilds: true, // Ignora ESLint durante la construcción
      }
  };
  
  export default nextConfig;
  