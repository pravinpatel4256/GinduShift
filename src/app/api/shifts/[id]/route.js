import { NextResponse } from 'next/server';
import { getShiftById, updateShiftStatus } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const shift = await getShiftById(id);

        if (!shift) {
            return NextResponse.json(
                { error: 'Shift not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(shift);
    } catch (error) {
        console.error('Get shift error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const { status } = await request.json();

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        const shift = await updateShiftStatus(id, status);
        return NextResponse.json(shift);
    } catch (error) {
        console.error('Update shift error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
