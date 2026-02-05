# GinduShift - Pharmacy Staffing Platform (Locum Tenens)

A modern web portal connecting Pharmacy Owners with Pharmacists for temporary shifts.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)
![SQLite](https://img.shields.io/badge/SQLite-Database-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

### User Roles
- **Admin**: Verify pharmacist licenses, platform oversight
- **Pharmacy Owner**: Post shifts, approve/reject applicants
- **Pharmacist**: Search shifts, apply for opportunities

### Core Functionality
- ✅ License verification workflow
- ✅ Shift posting with date/time/rate management
- ✅ Application tracking (Pending → Approved → Booked)
- ✅ Platform fee calculation (8.33% markup)
- ✅ Search & filter shifts by rate, duration, location
- ✅ **Persistent SQLite database** (data survives restarts!)

### UI/UX
- Modern dark theme with glassmorphism
- Color-coded status badges
- Responsive design
- Smooth animations

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18
- **Styling**: CSS Modules
- **Database**: SQLite with Prisma ORM
- **ORM**: Prisma 5

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/pravinpatel4256/GinduShift.git

# Navigate to the project
cd GinduShift

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Create database and run migrations
npx prisma migrate dev

# Seed the database with demo data
npm run dev
# Then visit: http://localhost:3000/api/seed (POST request)
# Or use: curl -X POST http://localhost:3000/api/seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@locumtenens.com` | `admin123` | Admin |
| `owner1@pharmacy.com` | `owner123` | Pharmacy Owner |
| `pharmacist1@email.com` | `pharm123` | Pharmacist (Verified) |
| `pharmacist2@email.com` | `pharm123` | Pharmacist (Pending) |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/            # API Routes (REST endpoints)
│   │   ├── auth/       # Authentication
│   │   ├── users/      # User management
│   │   ├── shifts/     # Shift CRUD
│   │   ├── applications/ # Application handling
│   │   └── seed/       # Database seeding
│   ├── admin/          # Admin dashboard
│   ├── owner/          # Owner dashboard & post-shift
│   ├── pharmacist/     # Pharmacist dashboard & search
│   ├── login/          # Authentication
│   └── layout.js       # Root layout
├── components/
│   ├── ShiftCard.js    # Shift display card
│   ├── StatusBadge.js  # Color-coded badges
│   ├── Navigation.js   # Top navigation
│   └── FilterPanel.js  # Search filters
├── context/
│   └── AuthContext.js  # Authentication state
├── lib/
│   ├── prisma.js       # Prisma client singleton
│   ├── db.js           # Database service layer
│   └── dataStore.js    # Fee calculations
└── prisma/
    ├── schema.prisma   # Database schema
    └── migrations/     # Database migrations
```

## 💰 Fee Structure

| Metric | Value |
|--------|-------|
| Pharmacist Rate | $60/hr |
| Platform Fee | 8.33% |
| Owner Cost | $65/hr |

The platform fee is automatically calculated and displayed transparently to owners.

## 🗄️ Database Schema

```prisma
model User {
  id                 String   @id
  email              String   @unique
  name               String
  role               String   // 'admin', 'owner', 'pharmacist'
  verificationStatus String?  // 'pending', 'verified', 'rejected'
  // ... owner & pharmacist specific fields
}

model Shift {
  id           String   @id
  ownerId      String
  pharmacyName String
  location     String
  hourlyRate   Float
  status       String   // 'open', 'filled', 'cancelled'
  // ... date/time fields
}

model Application {
  id           String   @id
  shiftId      String
  pharmacistId String
  status       String   // 'pending', 'approved', 'rejected'
}
```

## 🔄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/users` | List users |
| PATCH | `/api/users/[id]` | Update user (verification) |
| GET | `/api/shifts` | List/search shifts |
| POST | `/api/shifts` | Create shift |
| GET | `/api/applications` | List applications |
| POST | `/api/applications` | Create application |
| PATCH | `/api/applications/[id]` | Update application status |
| POST | `/api/seed` | Seed database |

## 🔄 Workflow

### For Pharmacy Owners
1. Sign up / Log in
2. Post a shift with details
3. Review applications
4. Approve the best candidate

### For Pharmacists
1. Sign up / Log in
2. Wait for admin verification
3. Search available shifts
4. Apply with one click
5. Track application status

### For Admins
1. Log in to admin dashboard
2. Review pending pharmacist registrations
3. Verify or reject licenses

## 🚀 Upgrading to PostgreSQL

To use PostgreSQL in production:

1. Update `.env`:
```
DATABASE_URL="postgresql://user:password@host:5432/gindushift"
```

2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run migrations:
```bash
npx prisma migrate dev
```

## 📄 License

MIT License - feel free to use this for your own projects!

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.
