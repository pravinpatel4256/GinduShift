// Database Service for Locum Tenens Portal
// Uses Prisma ORM with SQLite for persistent storage

import prisma from './prisma';

// Platform fee percentage (8.33% markup means owner pays $65 for $60/hr pharmacist rate)
export const PLATFORM_FEE_PERCENTAGE = 8.33;

// Calculate owner cost from pharmacist rate
export const calculateOwnerCost = (pharmacistRate) => {
    return Math.round(pharmacistRate * (1 + PLATFORM_FEE_PERCENTAGE / 100) * 100) / 100;
};

// Calculate pharmacist earnings from owner rate
export const calculatePharmacistEarnings = (ownerRate) => {
    return Math.round(ownerRate / (1 + PLATFORM_FEE_PERCENTAGE / 100) * 100) / 100;
};

// ============ USER FUNCTIONS ============

export const getAllUsers = async () => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return users.map(parseUser);
};

export const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id }
    });
    return user ? parseUser(user) : null;
};

export const getUserByEmail = async (email) => {
    // Try exact match first (faster)
    let user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        // Try case-insensitive match
        user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email,
                }
            }
        });
        // Note: SQLite might not support mode: 'insensitive' without specific collation, 
        // so we rely on the fact that if exact match failed, we might need to handle it.
        // But for now, let's stick to simple findUnique as primary, 
        // and if needed, we might need a raw query for true case insensitivity in SQLite if not configured.

        // Actually, for broad compatibility, let's check by finding via raw query or assuming strictness.
        // Just return null if not found.
    }
    return user ? parseUser(user) : null;
};

export const getUserByGoogleId = async (googleId) => {
    const user = await prisma.user.findUnique({
        where: { googleId }
    });
    return user ? parseUser(user) : null;
};

export const getPharmacists = async () => {
    const users = await prisma.user.findMany({
        where: { role: 'pharmacist' },
        orderBy: { createdAt: 'desc' }
    });
    return users.map(parseUser);
};

export const getOwners = async () => {
    const users = await prisma.user.findMany({
        where: { role: 'owner' },
        orderBy: { createdAt: 'desc' }
    });
    return users.map(parseUser);
};

export const updateUserVerification = async (userId, status) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: { verificationStatus: status }
    });
    return parseUser(user);
};

export const createUser = async (userData) => {
    const user = await prisma.user.create({
        data: {
            email: userData.email,
            password: userData.password || null,
            name: userData.name,
            role: userData.role,
            googleId: userData.googleId || null,
            image: userData.image || null,
            pharmacyName: userData.pharmacyName,
            address: userData.address,
            phone: userData.phone,
            licenseNumber: userData.licenseNumber,
            verificationStatus: userData.role === 'pharmacist' ? 'pending' : null,
            yearsExperience: userData.yearsExperience,
            specialties: userData.specialties ? JSON.stringify(userData.specialties) : null,
            bio: userData.bio
        }
    });
    return parseUser(user);
};

export const findOrCreateOAuthUser = async (profile, role = null) => {
    // Check if user exists by Google ID
    let user = await prisma.user.findUnique({
        where: { googleId: profile.sub || profile.id }
    });

    if (user) {
        return parseUser(user);
    }

    // Check if user exists by email
    user = await prisma.user.findUnique({
        where: { email: profile.email }
    });

    if (user) {
        // Link Google account to existing user
        user = await prisma.user.update({
            where: { id: user.id },
            data: {
                googleId: profile.sub || profile.id,
                image: profile.picture || profile.image
            }
        });
        return parseUser(user);
    }

    // Create new user - role must be provided for new users
    if (!role) {
        return { needsRole: true, profile };
    }

    user = await prisma.user.create({
        data: {
            email: profile.email,
            name: profile.name,
            googleId: profile.sub || profile.id,
            image: profile.picture || profile.image,
            role: role,
            verificationStatus: role === 'pharmacist' ? 'pending' : null
        }
    });

    return parseUser(user);
};

// Parse user from database format to app format
const parseUser = (user) => ({
    ...user,
    specialties: user.specialties ? JSON.parse(user.specialties) : []
});

// ============ SHIFT FUNCTIONS ============

export const getAllShifts = async () => {
    const shifts = await prisma.shift.findMany({
        orderBy: { createdAt: 'desc' },
        include: { owner: true }
    });
    return shifts.map(parseShift);
};

// Get shifts pending admin review
export const getPendingReviewShifts = async () => {
    const shifts = await prisma.shift.findMany({
        where: { status: 'pending_review' },
        orderBy: { createdAt: 'desc' },
        include: { owner: true }
    });
    return shifts.map(parseShift);
};

// Get open shifts (approved by admin, visible to pharmacists)
export const getOpenShifts = async () => {
    const shifts = await prisma.shift.findMany({
        where: { status: 'open' },
        orderBy: { createdAt: 'desc' },
        include: { owner: true }
    });
    return shifts.map(parseShift);
};

export const getShiftById = async (id) => {
    const shift = await prisma.shift.findUnique({
        where: { id },
        include: { owner: true }
    });
    return shift ? parseShift(shift) : null;
};

export const getShiftsByOwner = async (ownerId) => {
    const shifts = await prisma.shift.findMany({
        where: { ownerId },
        orderBy: { createdAt: 'desc' },
        include: { owner: true }
    });
    return shifts.map(parseShift);
};

export const createShift = async (shiftData) => {
    const owner = await getUserById(shiftData.ownerId);
    const shift = await prisma.shift.create({
        data: {
            ownerId: shiftData.ownerId,
            pharmacyName: owner?.pharmacyName || shiftData.pharmacyName || 'Unknown Pharmacy',
            location: shiftData.location,
            startDate: shiftData.startDate,
            endDate: shiftData.endDate,
            startTime: shiftData.startTime,
            endTime: shiftData.endTime,
            hoursPerDay: shiftData.hoursPerDay,
            hourlyRate: shiftData.hourlyRate,
            totalHours: shiftData.totalHours,
            description: shiftData.description,
            requirements: shiftData.requirements ? JSON.stringify(shiftData.requirements) : null,
            status: 'pending_review' // New shifts require admin approval
        },
        include: { owner: true }
    });
    return parseShift(shift);
};

export const updateShiftStatus = async (shiftId, status, adminNotes = null) => {
    const shift = await prisma.shift.update({
        where: { id: shiftId },
        data: {
            status,
            adminNotes: adminNotes || undefined
        },
        include: { owner: true }
    });
    return parseShift(shift);
};

// Admin approves a shift for pharmacist viewing
export const approveShift = async (shiftId, adminNotes = null) => {
    return updateShiftStatus(shiftId, 'open', adminNotes);
};

// Admin rejects a shift
export const rejectShift = async (shiftId, adminNotes) => {
    return updateShiftStatus(shiftId, 'rejected', adminNotes);
};

// Parse shift from database format to app format
const parseShift = (shift) => ({
    ...shift,
    requirements: shift.requirements ? JSON.parse(shift.requirements) : []
});

// ============ APPLICATION FUNCTIONS ============

export const getAllApplications = async () => {
    const applications = await prisma.application.findMany({
        orderBy: { appliedAt: 'desc' },
        include: {
            shift: { include: { owner: true } },
            pharmacist: true
        }
    });
    return applications.map(parseApplication);
};

export const getApplicationById = async (id) => {
    const application = await prisma.application.findUnique({
        where: { id },
        include: {
            shift: { include: { owner: true } },
            pharmacist: true
        }
    });
    return application ? parseApplication(application) : null;
};

export const getApplicationsByShift = async (shiftId) => {
    const applications = await prisma.application.findMany({
        where: { shiftId },
        orderBy: { appliedAt: 'desc' },
        include: {
            shift: { include: { owner: true } },
            pharmacist: true
        }
    });
    return applications.map(parseApplication);
};

export const getApplicationsByPharmacist = async (pharmacistId) => {
    const applications = await prisma.application.findMany({
        where: { pharmacistId },
        orderBy: { appliedAt: 'desc' },
        include: {
            shift: { include: { owner: true } },
            pharmacist: true
        }
    });
    return applications.map(parseApplication);
};

export const getApplicationsForOwner = async (ownerId) => {
    const applications = await prisma.application.findMany({
        where: {
            shift: { ownerId }
        },
        orderBy: { appliedAt: 'desc' },
        include: {
            shift: { include: { owner: true } },
            pharmacist: true
        }
    });
    return applications.map(parseApplication);
};

export const createApplication = async (applicationData) => {
    // Check if already applied
    const existing = await prisma.application.findUnique({
        where: {
            shiftId_pharmacistId: {
                shiftId: applicationData.shiftId,
                pharmacistId: applicationData.pharmacistId
            }
        }
    });

    if (existing) {
        return { error: 'Already applied to this shift' };
    }

    const application = await prisma.application.create({
        data: {
            shiftId: applicationData.shiftId,
            pharmacistId: applicationData.pharmacistId,
            message: applicationData.message,
            status: 'pending'
        },
        include: {
            shift: { include: { owner: true } },
            pharmacist: true
        }
    });

    return parseApplication(application);
};

export const updateApplicationStatus = async (applicationId, status) => {
    const application = await prisma.application.update({
        where: { id: applicationId },
        data: { status },
        include: {
            shift: { include: { owner: true } },
            pharmacist: true
        }
    });

    // If approved, mark the shift as filled and reject other applications
    if (status === 'approved') {
        await prisma.shift.update({
            where: { id: application.shiftId },
            data: { status: 'filled' }
        });

        // Reject other pending applications for the same shift
        await prisma.application.updateMany({
            where: {
                shiftId: application.shiftId,
                id: { not: applicationId },
                status: 'pending'
            },
            data: { status: 'rejected' }
        });
    }

    return parseApplication(application);
};

// Parse application from database format to app format
const parseApplication = (app) => ({
    ...app,
    shift: app.shift ? parseShift(app.shift) : null,
    pharmacist: app.pharmacist ? parseUser(app.pharmacist) : null
});

// ============ SEARCH & FILTER FUNCTIONS ============

export const searchShifts = async (filters = {}) => {
    const where = {
        status: 'open' // Only show approved shifts to pharmacists
    };

    // Filter by minimum rate
    if (filters.minRate) {
        where.hourlyRate = { ...where.hourlyRate, gte: filters.minRate };
    }

    // Filter by maximum rate
    if (filters.maxRate) {
        where.hourlyRate = { ...where.hourlyRate, lte: filters.maxRate };
    }

    // Filter by minimum duration
    if (filters.minDuration) {
        where.totalHours = { ...where.totalHours, gte: filters.minDuration };
    }

    // Filter by maximum duration
    if (filters.maxDuration) {
        where.totalHours = { ...where.totalHours, lte: filters.maxDuration };
    }

    // Filter by location
    if (filters.location) {
        where.location = { contains: filters.location };
    }

    // Filter by date range
    if (filters.startDate) {
        where.startDate = { ...where.startDate, gte: filters.startDate };
    }

    if (filters.endDate) {
        where.endDate = { ...where.endDate, lte: filters.endDate };
    }

    const shifts = await prisma.shift.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { owner: true }
    });

    return shifts.map(parseShift);
};

// ============ UTILITY FUNCTIONS ============

export const getEnrichedApplications = (applications) => {
    // Applications are already enriched when fetched with include
    return applications;
};

// Get dashboard stats
export const getAdminStats = async () => {
    const [
        totalPharmacists,
        pendingVerifications,
        verifiedPharmacists,
        totalOwners,
        totalShifts,
        openShifts,
        pendingReviewShifts
    ] = await Promise.all([
        prisma.user.count({ where: { role: 'pharmacist' } }),
        prisma.user.count({ where: { role: 'pharmacist', verificationStatus: 'pending' } }),
        prisma.user.count({ where: { role: 'pharmacist', verificationStatus: 'verified' } }),
        prisma.user.count({ where: { role: 'owner' } }),
        prisma.shift.count(),
        prisma.shift.count({ where: { status: 'open' } }),
        prisma.shift.count({ where: { status: 'pending_review' } })
    ]);

    return {
        totalPharmacists,
        pendingVerifications,
        verifiedPharmacists,
        totalOwners,
        totalShifts,
        openShifts,
        pendingReviewShifts
    };
};

// Seed database with initial data
export const seedDatabase = async () => {
    // Check if data already exists
    const userCount = await prisma.user.count();
    if (userCount > 0) {
        console.log('Database already seeded');
        return;
    }

    console.log('Seeding database...');

    // Create Admin
    const admin = await prisma.user.create({
        data: {
            email: 'admin@locumtenens.com',
            password: 'admin123',
            name: 'System Admin',
            role: 'admin'
        }
    });

    // Create Owners
    const owner1 = await prisma.user.create({
        data: {
            email: 'owner1@pharmacy.com',
            password: 'owner123',
            name: "John's Pharmacy",
            role: 'owner',
            pharmacyName: "John's Community Pharmacy",
            address: '123 Main Street, Boston, MA 02101',
            phone: '(617) 555-0101'
        }
    });

    const owner2 = await prisma.user.create({
        data: {
            email: 'owner2@pharmacy.com',
            password: 'owner123',
            name: 'MedCare Pharmacy',
            role: 'owner',
            pharmacyName: 'MedCare 24/7 Pharmacy',
            address: '456 Health Ave, Cambridge, MA 02139',
            phone: '(617) 555-0202'
        }
    });

    // Create Pharmacists
    const pharm1 = await prisma.user.create({
        data: {
            email: 'pharmacist1@email.com',
            password: 'pharm123',
            name: 'Dr. Sarah Johnson',
            role: 'pharmacist',
            licenseNumber: 'MA-RPH-12345',
            verificationStatus: 'verified',
            yearsExperience: 8,
            specialties: JSON.stringify(['Retail', 'Compounding']),
            bio: 'Experienced retail pharmacist with a focus on patient care.'
        }
    });

    const pharm2 = await prisma.user.create({
        data: {
            email: 'pharmacist2@email.com',
            password: 'pharm123',
            name: 'Dr. Michael Chen',
            role: 'pharmacist',
            licenseNumber: 'MA-RPH-67890',
            verificationStatus: 'pending',
            yearsExperience: 3,
            specialties: JSON.stringify(['Hospital', 'Clinical']),
            bio: 'Clinical pharmacist transitioning to community practice.'
        }
    });

    const pharm3 = await prisma.user.create({
        data: {
            email: 'pharmacist3@email.com',
            password: 'pharm123',
            name: 'Dr. Emily Davis',
            role: 'pharmacist',
            licenseNumber: 'MA-RPH-11111',
            verificationStatus: 'pending',
            yearsExperience: 5,
            specialties: JSON.stringify(['Retail', 'Long-term Care']),
            bio: 'Specializing in geriatric pharmacy care.'
        }
    });

    // Create Shifts - some pending review, some approved
    const shift1 = await prisma.shift.create({
        data: {
            ownerId: owner1.id,
            pharmacyName: "John's Community Pharmacy",
            location: '123 Main Street, Boston, MA 02101',
            startDate: '2026-02-10',
            endDate: '2026-02-10',
            startTime: '09:00',
            endTime: '17:00',
            hoursPerDay: 8,
            hourlyRate: 60,
            totalHours: 8,
            description: 'Regular retail shift. Must be comfortable with high-volume dispensing.',
            requirements: JSON.stringify(['Retail experience', 'State license']),
            status: 'open' // Already approved
        }
    });

    const shift2 = await prisma.shift.create({
        data: {
            ownerId: owner1.id,
            pharmacyName: "John's Community Pharmacy",
            location: '123 Main Street, Boston, MA 02101',
            startDate: '2026-02-15',
            endDate: '2026-02-17',
            startTime: '08:00',
            endTime: '16:00',
            hoursPerDay: 8,
            hourlyRate: 65,
            totalHours: 24,
            description: 'Weekend coverage needed. Three consecutive days.',
            requirements: JSON.stringify(['Weekend availability', 'State license']),
            status: 'pending_review' // Needs admin approval
        }
    });

    const shift3 = await prisma.shift.create({
        data: {
            ownerId: owner2.id,
            pharmacyName: 'MedCare 24/7 Pharmacy',
            location: '456 Health Ave, Cambridge, MA 02139',
            startDate: '2026-02-12',
            endDate: '2026-02-12',
            startTime: '22:00',
            endTime: '06:00',
            hoursPerDay: 8,
            hourlyRate: 75,
            totalHours: 8,
            description: 'Overnight shift at 24-hour pharmacy. Quiet but requires independence.',
            requirements: JSON.stringify(['Night shift experience', 'State license']),
            status: 'open' // Already approved
        }
    });

    const shift4 = await prisma.shift.create({
        data: {
            ownerId: owner2.id,
            pharmacyName: 'MedCare 24/7 Pharmacy',
            location: '456 Health Ave, Cambridge, MA 02139',
            startDate: '2026-02-20',
            endDate: '2026-02-28',
            startTime: '09:00',
            endTime: '17:00',
            hoursPerDay: 8,
            hourlyRate: 62,
            totalHours: 72,
            description: 'Extended coverage for vacation relief. Monday through Friday for 9 days.',
            requirements: JSON.stringify(['Retail experience', 'State license', 'Immunization certified']),
            status: 'pending_review' // Needs admin approval
        }
    });

    // Create sample application
    await prisma.application.create({
        data: {
            shiftId: shift1.id,
            pharmacistId: pharm1.id,
            status: 'pending',
            message: 'I am available for this shift and have 8 years of retail experience.'
        }
    });

    console.log('Database seeded successfully!');
};
