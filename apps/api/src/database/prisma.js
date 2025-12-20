import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Create a single instance of Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('[Database] ✓ Connected to database');
  })
  .catch((error) => {
    console.error('[Database] ✗ Failed to connect to database:', error.message);
    console.error('[Database] DATABASE_URL:', process.env.DATABASE_URL ? 'configured' : 'missing');
  });

export default prisma;