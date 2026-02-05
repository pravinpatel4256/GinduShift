-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shift" (
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
);
INSERT INTO "new_Shift" ("createdAt", "description", "endDate", "endTime", "hourlyRate", "hoursPerDay", "id", "location", "ownerId", "pharmacyName", "requirements", "startDate", "startTime", "status", "totalHours", "updatedAt") SELECT "createdAt", "description", "endDate", "endTime", "hourlyRate", "hoursPerDay", "id", "location", "ownerId", "pharmacyName", "requirements", "startDate", "startTime", "status", "totalHours", "updatedAt" FROM "Shift";
DROP TABLE "Shift";
ALTER TABLE "new_Shift" RENAME TO "Shift";
CREATE INDEX "Shift_ownerId_idx" ON "Shift"("ownerId");
CREATE INDEX "Shift_status_idx" ON "Shift"("status");
CREATE TABLE "new_User" (
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
);
INSERT INTO "new_User" ("address", "bio", "createdAt", "email", "id", "licenseNumber", "name", "password", "pharmacyName", "phone", "role", "specialties", "updatedAt", "verificationStatus", "yearsExperience") SELECT "address", "bio", "createdAt", "email", "id", "licenseNumber", "name", "password", "pharmacyName", "phone", "role", "specialties", "updatedAt", "verificationStatus", "yearsExperience" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_googleId_idx" ON "User"("googleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
