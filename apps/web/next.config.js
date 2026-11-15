/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@teacherpilot/db',
      'ai',
      'dispatch',
      '@prisma/client',
      'prisma',
      'nodemailer'
    ]
  },
  reactStrictMode: false
};

module.exports = nextConfig;
