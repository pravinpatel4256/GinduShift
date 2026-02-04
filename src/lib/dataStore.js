// In-Memory Database for Locum Tenens Portal
// This simulates a database using a global store

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

// Initial Users Data
const initialUsers = [
    // Admin
    {
        id: 'admin-001',
        email: 'admin@locumtenens.com',
        password: 'admin123',
        name: 'System Admin',
        role: 'admin',
        createdAt: '2025-01-01T00:00:00Z'
    },
    // Pharmacy Owners
    {
        id: 'owner-001',
        email: 'owner1@pharmacy.com',
        password: 'owner123',
        name: "John's Pharmacy",
        role: 'owner',
        pharmacyName: "John's Community Pharmacy",
        address: '123 Main Street, Boston, MA 02101',
        phone: '(617) 555-0101',
        createdAt: '2025-01-05T00:00:00Z'
    },
    {
        id: 'owner-002',
        email: 'owner2@pharmacy.com',
        password: 'owner123',
        name: 'MedCare Pharmacy',
        role: 'owner',
        pharmacyName: 'MedCare 24/7 Pharmacy',
        address: '456 Health Ave, Cambridge, MA 02139',
        phone: '(617) 555-0202',
        createdAt: '2025-01-10T00:00:00Z'
    },
    // Pharmacists
    {
        id: 'pharm-001',
        email: 'pharmacist1@email.com',
        password: 'pharm123',
        name: 'Dr. Sarah Johnson',
        role: 'pharmacist',
        licenseNumber: 'MA-RPH-12345',
        verificationStatus: 'verified', // verified, pending, rejected
        yearsExperience: 8,
        specialties: ['Retail', 'Compounding'],
        bio: 'Experienced retail pharmacist with a focus on patient care.',
        createdAt: '2025-01-15T00:00:00Z'
    },
    {
        id: 'pharm-002',
        email: 'pharmacist2@email.com',
        password: 'pharm123',
        name: 'Dr. Michael Chen',
        role: 'pharmacist',
        licenseNumber: 'MA-RPH-67890',
        verificationStatus: 'pending',
        yearsExperience: 3,
        specialties: ['Hospital', 'Clinical'],
        bio: 'Clinical pharmacist transitioning to community practice.',
        createdAt: '2025-01-20T00:00:00Z'
    },
    {
        id: 'pharm-003',
        email: 'pharmacist3@email.com',
        password: 'pharm123',
        name: 'Dr. Emily Davis',
        role: 'pharmacist',
        licenseNumber: 'MA-RPH-11111',
        verificationStatus: 'pending',
        yearsExperience: 5,
        specialties: ['Retail', 'Long-term Care'],
        bio: 'Specializing in geriatric pharmacy care.',
        createdAt: '2025-01-25T00:00:00Z'
    }
];

// Initial Shifts Data
const initialShifts = [
    {
        id: 'shift-001',
        ownerId: 'owner-001',
        pharmacyName: "John's Community Pharmacy",
        location: '123 Main Street, Boston, MA 02101',
        startDate: '2026-02-10',
        endDate: '2026-02-10',
        startTime: '09:00',
        endTime: '17:00',
        hoursPerDay: 8,
        hourlyRate: 60, // What pharmacist earns
        totalHours: 8,
        description: 'Regular retail shift. Must be comfortable with high-volume dispensing.',
        requirements: ['Retail experience', 'State license'],
        status: 'open', // open, filled, cancelled
        createdAt: '2025-02-01T00:00:00Z'
    },
    {
        id: 'shift-002',
        ownerId: 'owner-001',
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
        requirements: ['Weekend availability', 'State license'],
        status: 'open',
        createdAt: '2025-02-01T00:00:00Z'
    },
    {
        id: 'shift-003',
        ownerId: 'owner-002',
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
        requirements: ['Night shift experience', 'State license'],
        status: 'open',
        createdAt: '2025-02-02T00:00:00Z'
    },
    {
        id: 'shift-004',
        ownerId: 'owner-002',
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
        requirements: ['Retail experience', 'State license', 'Immunization certified'],
        status: 'open',
        createdAt: '2025-02-02T00:00:00Z'
    }
];

// Initial Applications Data
const initialApplications = [
    {
        id: 'app-001',
        shiftId: 'shift-001',
        pharmacistId: 'pharm-001',
        status: 'pending', // pending, approved, rejected, withdrawn
        appliedAt: '2025-02-03T10:00:00Z',
        message: 'I am available for this shift and have 8 years of retail experience.'
    }
];

// Global store - In a real app, this would be a database
let dataStore = {
    users: [...initialUsers],
    shifts: [...initialShifts],
    applications: [...initialApplications]
};

// ============ USER FUNCTIONS ============

export const getAllUsers = () => {
    return [...dataStore.users];
};

export const getUserById = (id) => {
    return dataStore.users.find(user => user.id === id) || null;
};

export const getUserByEmail = (email) => {
    return dataStore.users.find(user => user.email === email) || null;
};

export const getPharmacists = () => {
    return dataStore.users.filter(user => user.role === 'pharmacist');
};

export const getOwners = () => {
    return dataStore.users.filter(user => user.role === 'owner');
};

export const updateUserVerification = (userId, status) => {
    const userIndex = dataStore.users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        dataStore.users[userIndex] = {
            ...dataStore.users[userIndex],
            verificationStatus: status
        };
        return dataStore.users[userIndex];
    }
    return null;
};

export const createUser = (userData) => {
    const newUser = {
        ...userData,
        id: `${userData.role}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...(userData.role === 'pharmacist' && { verificationStatus: 'pending' })
    };
    dataStore.users.push(newUser);
    return newUser;
};

// ============ SHIFT FUNCTIONS ============

export const getAllShifts = () => {
    return [...dataStore.shifts];
};

export const getOpenShifts = () => {
    return dataStore.shifts.filter(shift => shift.status === 'open');
};

export const getShiftById = (id) => {
    return dataStore.shifts.find(shift => shift.id === id) || null;
};

export const getShiftsByOwner = (ownerId) => {
    return dataStore.shifts.filter(shift => shift.ownerId === ownerId);
};

export const createShift = (shiftData) => {
    const owner = getUserById(shiftData.ownerId);
    const newShift = {
        ...shiftData,
        id: `shift-${Date.now()}`,
        pharmacyName: owner?.pharmacyName || 'Unknown Pharmacy',
        status: 'open',
        createdAt: new Date().toISOString()
    };
    dataStore.shifts.push(newShift);
    return newShift;
};

export const updateShiftStatus = (shiftId, status) => {
    const shiftIndex = dataStore.shifts.findIndex(shift => shift.id === shiftId);
    if (shiftIndex !== -1) {
        dataStore.shifts[shiftIndex] = {
            ...dataStore.shifts[shiftIndex],
            status
        };
        return dataStore.shifts[shiftIndex];
    }
    return null;
};

// ============ APPLICATION FUNCTIONS ============

export const getAllApplications = () => {
    return [...dataStore.applications];
};

export const getApplicationById = (id) => {
    return dataStore.applications.find(app => app.id === id) || null;
};

export const getApplicationsByShift = (shiftId) => {
    return dataStore.applications.filter(app => app.shiftId === shiftId);
};

export const getApplicationsByPharmacist = (pharmacistId) => {
    return dataStore.applications.filter(app => app.pharmacistId === pharmacistId);
};

export const getApplicationsForOwner = (ownerId) => {
    const ownerShifts = getShiftsByOwner(ownerId);
    const shiftIds = ownerShifts.map(shift => shift.id);
    return dataStore.applications.filter(app => shiftIds.includes(app.shiftId));
};

export const createApplication = (applicationData) => {
    // Check if already applied
    const existing = dataStore.applications.find(
        app => app.shiftId === applicationData.shiftId &&
            app.pharmacistId === applicationData.pharmacistId
    );
    if (existing) {
        return { error: 'Already applied to this shift' };
    }

    const newApplication = {
        ...applicationData,
        id: `app-${Date.now()}`,
        status: 'pending',
        appliedAt: new Date().toISOString()
    };
    dataStore.applications.push(newApplication);
    return newApplication;
};

export const updateApplicationStatus = (applicationId, status) => {
    const appIndex = dataStore.applications.findIndex(app => app.id === applicationId);
    if (appIndex !== -1) {
        dataStore.applications[appIndex] = {
            ...dataStore.applications[appIndex],
            status
        };

        // If approved, mark the shift as filled and reject other applications
        if (status === 'approved') {
            const shiftId = dataStore.applications[appIndex].shiftId;
            updateShiftStatus(shiftId, 'filled');

            // Reject other pending applications for the same shift
            dataStore.applications = dataStore.applications.map(app => {
                if (app.shiftId === shiftId && app.id !== applicationId && app.status === 'pending') {
                    return { ...app, status: 'rejected' };
                }
                return app;
            });
        }

        return dataStore.applications[appIndex];
    }
    return null;
};

// ============ SEARCH & FILTER FUNCTIONS ============

export const searchShifts = (filters = {}) => {
    let results = getOpenShifts();

    // Filter by minimum rate
    if (filters.minRate) {
        results = results.filter(shift => shift.hourlyRate >= filters.minRate);
    }

    // Filter by maximum rate
    if (filters.maxRate) {
        results = results.filter(shift => shift.hourlyRate <= filters.maxRate);
    }

    // Filter by minimum duration (total hours)
    if (filters.minDuration) {
        results = results.filter(shift => shift.totalHours >= filters.minDuration);
    }

    // Filter by maximum duration
    if (filters.maxDuration) {
        results = results.filter(shift => shift.totalHours <= filters.maxDuration);
    }

    // Filter by location (simple text match)
    if (filters.location) {
        results = results.filter(shift =>
            shift.location.toLowerCase().includes(filters.location.toLowerCase())
        );
    }

    // Filter by date range
    if (filters.startDate) {
        results = results.filter(shift => shift.startDate >= filters.startDate);
    }

    if (filters.endDate) {
        results = results.filter(shift => shift.endDate <= filters.endDate);
    }

    return results;
};

// ============ UTILITY FUNCTIONS ============

export const resetDataStore = () => {
    dataStore = {
        users: [...initialUsers],
        shifts: [...initialShifts],
        applications: [...initialApplications]
    };
};

// Helper to get enriched application data
export const getEnrichedApplications = (applications) => {
    return applications.map(app => ({
        ...app,
        shift: getShiftById(app.shiftId),
        pharmacist: getUserById(app.pharmacistId)
    }));
};

// Get dashboard stats
export const getAdminStats = () => {
    const pharmacists = getPharmacists();
    return {
        totalPharmacists: pharmacists.length,
        pendingVerifications: pharmacists.filter(p => p.verificationStatus === 'pending').length,
        verifiedPharmacists: pharmacists.filter(p => p.verificationStatus === 'verified').length,
        totalOwners: getOwners().length,
        totalShifts: getAllShifts().length,
        openShifts: getOpenShifts().length
    };
};
