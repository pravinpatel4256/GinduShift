// Script to seed admin account to Turso
import { createClient } from '@libsql/client';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function seedAdmin() {
    console.log('🚀 Checking for admin account in Turso...');

    try {
        // Check if admin exists
        const result = await client.execute({
            sql: "SELECT * FROM User WHERE email = ?",
            args: ["admin@locumtenens.com"]
        });

        if (result.rows.length > 0) {
            console.log('✅ Admin account already exists.');
            return;
        }

        console.log('📝 Creating admin account...');

        // Create admin user
        const adminId = 'admin-' + Date.now();
        await client.execute({
            sql: `INSERT INTO User (id, email, password, name, role, createdAt, updatedAt) 
                  VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            args: [
                adminId,
                'admin@locumtenens.com',
                'admin123',
                'System Admin',
                'admin'
            ]
        });

        console.log('✅ Admin account created successfully!');
        console.log('   Email: admin@locumtenens.com');
        console.log('   Password: admin123');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

seedAdmin();
