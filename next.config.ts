// next.config.ts — Configuración de Next.js
//
// "standalone": genera una versión autocontenida de la app
// que incluye solo los archivos necesarios para producción.
// Es necesario para el Dockerfile multi-stage — sin esto,
// el build de Docker no tendría el archivo server.js.

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
