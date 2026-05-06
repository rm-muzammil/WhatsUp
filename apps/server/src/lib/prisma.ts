// src/lib/prisma.ts
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'



const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined; 
}; 
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL, 
}); 
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, 
  }); 
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 
export default prisma; 

// import 'dotenv/config'
// import { PrismaClient } from '@prisma/client'

// declare global {
//   var prisma: PrismaClient | undefined
// }

// export const prisma =
//   globalThis.prisma ??
//   new PrismaClient({
//     log: ['error', 'warn'],
//   })

// if (process.env.NODE_ENV !== 'production') {
//   globalThis.prisma = prisma
// }