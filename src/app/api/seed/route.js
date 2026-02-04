import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db';

export async function POST() {
    try {
        await seedDatabase();
        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json(
            { error: 'Failed to seed database', details: error.message },
            { status: 500 }
        );
    }
}
