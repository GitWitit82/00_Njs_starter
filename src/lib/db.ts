import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export { prisma }
export const db = prisma