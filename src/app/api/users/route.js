import { NextResponse } from 'next/server';
import {
    getAllUsers,
    getPharmacists,
    createUser,
    getAdminStats
} from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const stats = searchParams.get('stats');

        if (stats === 'admin') {
            const adminStats = await getAdminStats();
            return NextResponse.json(adminStats);
        }

        if (role === 'pharmacist') {
            const pharmacists = await getPharmacists();
            // Remove passwords
            const safePharmacists = pharmacists.map(({ password, ...rest }) => rest);
            return NextResponse.json(safePharmacists);
        }

        const users = await getAllUsers();
        // Remove passwords
        const safeUsers = users.map(({ password, ...rest }) => rest);
        return NextResponse.json(safeUsers);
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const userData = await request.json();
        const user = await createUser(userData);
        const { password, ...safeUser } = user;
        return NextResponse.json(safeUser, { status: 201 });
    } catch (error) {
        console.error('Create user error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
