import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis;

function createPrismaClient() {
    // Check if Turso credentials are available (production/cloud deployment)
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (tursoUrl && tursoToken) {
        // Production: Use Turso with libsql adapter
        console.log('[Prisma] Using Turso database:', tursoUrl);
        const libsql = createClient({
            url: tursoUrl,
            authToken: tursoToken,
        });
        const adapter = new PrismaLibSQL(libsql);
        return new PrismaClient({ adapter });
    } else {
        // Development: Use local SQLite
        console.log('[Prisma] Using local SQLite database');
        return new PrismaClient();
    }
}

export const prisma = globalForPrisma.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prismaGlobal = prisma;
}

export default prisma;
