-- Turso Migration: Create all tables for Locum Tenens Portal

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
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

-- CreateTable
CREATE TABLE IF NOT EXISTS "Shift" (
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

-- CreateTable
CREATE TABLE IF NOT EXISTS "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shiftId" TEXT NOT NULL,
    "pharmacistId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Application_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_googleId_idx" ON "User"("googleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Shift_ownerId_idx" ON "Shift"("ownerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Shift_status_idx" ON "Shift"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Application_shiftId_idx" ON "Application"("shiftId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Application_pharmacistId_idx" ON "Application"("pharmacistId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Application_shiftId_pharmacistId_key" ON "Application"("shiftId", "pharmacistId");
