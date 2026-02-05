import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';

export async function POST(request) {
    try {
        const userData = await request.json();

        // Validate required fields
        if (!userData.email || !userData.name || !userData.role) {
            return NextResponse.json(
                { error: 'Email, name, and role are required' },
                { status: 400 }
            );
        }

        // Validate role
        if (!['pharmacist', 'owner'].includes(userData.role)) {
            return NextResponse.json(
                { error: 'Role must be pharmacist or owner' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await getUserByEmail(userData.email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Validate password for non-OAuth users
        if (!userData.googleId && !userData.password) {
            return NextResponse.json(
                { error: 'Password is required' },
                { status: 400 }
            );
        }

        // Create the user
        const user = await createUser(userData);

        // Remove password from response
        const { password, ...safeUser } = user;

        return NextResponse.json(safeUser, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        );
    }
}
