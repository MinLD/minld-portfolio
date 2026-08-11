import { compare, hash } from 'bcrypt'

export const hashPassword = (password: string) => hash(password, 12)
export const verifyPassword = (password: string, passwordHash: string) => compare(password, passwordHash)
