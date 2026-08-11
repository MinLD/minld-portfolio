import type { Prisma } from '@prisma/client'
import { prisma } from './prisma.js'

export type TxClient = Prisma.TransactionClient
export const runTransaction = <T>(fn: (tx: TxClient) => Promise<T>) => prisma.$transaction(fn)
