/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gera arquivos HTML estáticos (Next.js Export Mode)
  output: 'export',

  // Ignora erros do ESLint no build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Usa <Image> sem otimização, necessário com export
  images: {
    unoptimized: true,
  },

  // Habilita compatibilidade com imagens do public/
  trailingSlash: true, // Opcional: evita 404 em alguns servidores estáticos
};

module.exports = nextConfig;
