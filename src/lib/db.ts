import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Simple error wrapper for database operations
export async function safeDbOperation<T>(
  operation: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    console.error('Database error:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    }
  }
}
