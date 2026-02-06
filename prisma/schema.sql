-- ========================================
-- Locum Tenens Portal Database Schema
-- SQLite / Turso (libSQL)
-- ========================================

-- Users Table
CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'pharmacist',
    
    -- Profile fields
    phone TEXT,
    licenseNumber TEXT,
    licenseState TEXT,
    yearsExperience INTEGER,
    specializations TEXT,
    bio TEXT,
    image TEXT,
    
    -- Owner specific
    pharmacyName TEXT,
    pharmacyAddress TEXT,
    
    -- OAuth
    googleId TEXT UNIQUE,
    
    -- Verification
    verified TEXT DEFAULT 'pending',
    adminNotes TEXT,
    
    -- Timestamps
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for User
CREATE INDEX IF NOT EXISTS User_email_idx ON User(email);
CREATE INDEX IF NOT EXISTS User_role_idx ON User(role);
CREATE INDEX IF NOT EXISTS User_googleId_idx ON User(googleId);

-- Shifts Table
CREATE TABLE IF NOT EXISTS Shift (
    id TEXT PRIMARY KEY,
    ownerId TEXT NOT NULL,
    
    pharmacyName TEXT NOT NULL,
    location TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    hoursPerDay INTEGER NOT NULL,
    hourlyRate REAL NOT NULL,
    totalHours INTEGER NOT NULL,
    
    description TEXT,
    requirements TEXT,
    
    -- Accommodation & Travel Benefits
    accommodationProvided INTEGER DEFAULT 0,
    accommodationDetails TEXT,
    mileageAllowance INTEGER DEFAULT 0,
    mileageRate REAL,
    
    -- Approval workflow
    status TEXT DEFAULT 'pending_review',
    adminNotes TEXT,
    
    -- Timestamps
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ownerId) REFERENCES User(id)
);

-- Indexes for Shift
CREATE INDEX IF NOT EXISTS Shift_ownerId_idx ON Shift(ownerId);
CREATE INDEX IF NOT EXISTS Shift_status_idx ON Shift(status);

-- Applications Table
CREATE TABLE IF NOT EXISTS Application (
    id TEXT PRIMARY KEY,
    shiftId TEXT NOT NULL,
    pharmacistId TEXT NOT NULL,
    
    status TEXT DEFAULT 'pending',
    coverLetter TEXT,
    
    -- Timestamps
    appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (shiftId) REFERENCES Shift(id),
    FOREIGN KEY (pharmacistId) REFERENCES User(id),
    UNIQUE(shiftId, pharmacistId)
);

-- Indexes for Application
CREATE INDEX IF NOT EXISTS Application_shiftId_idx ON Application(shiftId);
CREATE INDEX IF NOT EXISTS Application_pharmacistId_idx ON Application(pharmacistId);
CREATE INDEX IF NOT EXISTS Application_status_idx ON Application(status);

-- ========================================
-- Status Values Reference
-- ========================================
-- User.role: 'admin', 'owner', 'pharmacist'
-- User.verified: 'pending', 'verified', 'rejected'  
-- Shift.status: 'pending_review', 'open', 'filled', 'cancelled', 'rejected'
-- Application.status: 'pending', 'approved', 'rejected', 'withdrawn'
