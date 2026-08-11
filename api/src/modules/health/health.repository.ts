import { prisma } from '../../database/prisma.js'

export async function isDatabaseReady() {
  await prisma.$queryRaw`SELECT 1`
  return true
}
