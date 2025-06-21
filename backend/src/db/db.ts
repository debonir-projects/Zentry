import { PrismaClient } from "./prisma/generated/prisma";
declare global {
    var prisma: PrismaClient | undefined;
  
}
export const db = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
// Create a singleton Prisma client instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});


prisma.$connect()
  .then(() => {
    console.log('Connected to NeonDB database');
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });

export default prisma;