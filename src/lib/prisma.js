import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis;

function createPrismaClient() {
    // Check if we're using Turso (libsql:// URL)
    const dbUrl = process.env.DATABASE_URL || '';
    
    if (dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://')) {
        // Production: Use Turso with libsql adapter
        const libsql = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
        const adapter = new PrismaLibSQL(libsql);
        return new PrismaClient({ adapter });
    } else {
        // Development: Use local SQLite
        return new PrismaClient();
    }
}

export const prisma = globalForPrisma.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prismaGlobal = prisma;
}

export default prisma;
