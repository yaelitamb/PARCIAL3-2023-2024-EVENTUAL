/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Activa React Strict Mode para mejores errores y advertencias.
    experimental: {
      appDir: true, // Activa la característica de `app/` para rutas.
    },
    output: "standalone", // Requerido para Vercel en configuraciones avanzadas.
  };
  
  export default nextConfig;
  