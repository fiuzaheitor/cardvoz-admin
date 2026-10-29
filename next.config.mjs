/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Site estático (pasta out/), como o CardVoz: os dados vêm da API direto do navegador
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
