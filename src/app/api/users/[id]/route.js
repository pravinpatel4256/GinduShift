import { NextResponse } from 'next/server';
import { getUserById, updateUserVerification } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const user = await getUserById(id);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const { password, ...safeUser } = user;
        return NextResponse.json(safeUser);
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const { verificationStatus } = await request.json();

        if (!verificationStatus) {
            return NextResponse.json(
                { error: 'Verification status is required' },
                { status: 400 }
            );
        }

        const user = await updateUserVerification(id, verificationStatus);
        const { password, ...safeUser } = user;
        return NextResponse.json(safeUser);
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
