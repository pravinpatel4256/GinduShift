// Script to push Prisma schema to Turso
import { createClient } from '@libsql/client';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// Define all SQL statements
const migrations = [
    // Create User table
    `CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "password" TEXT,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        "googleId" TEXT,
        "image" TEXT,
        "pharmacyName" TEXT,
        "address" TEXT,
        "phone" TEXT,
        "licenseNumber" TEXT,
        "verificationStatus" TEXT DEFAULT 'pending',
        "yearsExperience" INTEGER,
        "specialties" TEXT,
        "bio" TEXT
    )`,

    // Create Shift table
    `CREATE TABLE IF NOT EXISTS "Shift" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "ownerId" TEXT NOT NULL,
        "pharmacyName" TEXT NOT NULL,
        "location" TEXT NOT NULL,
        "startDate" TEXT NOT NULL,
        "endDate" TEXT NOT NULL,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT NOT NULL,
        "hoursPerDay" INTEGER NOT NULL,
        "hourlyRate" REAL NOT NULL,
        "totalHours" INTEGER NOT NULL,
        "description" TEXT,
        "requirements" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending_review',
        "adminNotes" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "Shift_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )`,

    // Create Application table
    `CREATE TABLE IF NOT EXISTS "Application" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shiftId" TEXT NOT NULL,
        "pharmacistId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "message" TEXT,
        "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "Application_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Application_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )`,

    // Create indexes
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId")`,
    `CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email")`,
    `CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role")`,
    `CREATE INDEX IF NOT EXISTS "User_googleId_idx" ON "User"("googleId")`,
    `CREATE INDEX IF NOT EXISTS "Shift_ownerId_idx" ON "Shift"("ownerId")`,
    `CREATE INDEX IF NOT EXISTS "Shift_status_idx" ON "Shift"("status")`,
    `CREATE INDEX IF NOT EXISTS "Application_shiftId_idx" ON "Application"("shiftId")`,
    `CREATE INDEX IF NOT EXISTS "Application_pharmacistId_idx" ON "Application"("pharmacistId")`,
    `CREATE INDEX IF NOT EXISTS "Application_status_idx" ON "Application"("status")`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Application_shiftId_pharmacistId_key" ON "Application"("shiftId", "pharmacistId")`,
];

async function migrate() {
    console.log('🚀 Connecting to Turso database...');
    console.log(`   URL: ${process.env.TURSO_DATABASE_URL}`);
    console.log(`📝 Found ${migrations.length} SQL statements to execute\n`);

    try {
        for (let i = 0; i < migrations.length; i++) {
            const stmt = migrations[i];
            const preview = stmt.substring(0, 50).replace(/\n/g, ' ').replace(/\s+/g, ' ');
            console.log(`   [${i + 1}/${migrations.length}] ${preview}...`);

            await client.execute(stmt);
        }

        console.log('\n✅ Migration completed successfully!');

        // Verify tables were created
        const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'libsql_%'");
        console.log('\n📊 Tables in database:');
        tables.rows.forEach(row => console.log(`   - ${row.name}`));

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();
