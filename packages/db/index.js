const path = require('path');
const { PrismaClient } = require('@prisma/client');

const defaultDbPath = path.resolve(__dirname, 'prisma/dev.db');
const envUrl = process.env.DATABASE_URL;

// Ensure SQLite file path is always absolute so it works from apps/web or any working directory
let dbUrl = `file:${defaultDbPath}`;
if (envUrl && envUrl.startsWith('file:/')) {
  dbUrl = envUrl;
}

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = {
  prisma,
  PrismaClient,
  default: prisma,
};
