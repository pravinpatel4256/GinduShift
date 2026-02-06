import { NextResponse } from 'next/server';
import { getShiftById, updateShiftStatus, approveShift, rejectShift } from '@/lib/db';

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
        const { status, action, adminNotes, hourlyRate } = await request.json();

        // Handle admin approval/rejection
        if (action === 'approve') {
            const shift = await approveShift(id, adminNotes, hourlyRate);
            return NextResponse.json(shift);
        }

        if (action === 'reject') {
            if (!adminNotes) {
                return NextResponse.json(
                    { error: 'Admin notes required for rejection' },
                    { status: 400 }
                );
            }
            const shift = await rejectShift(id, adminNotes);
            return NextResponse.json(shift);
        }

        // Handle regular status update
        if (!status) {
            return NextResponse.json(
                { error: 'Status or action is required' },
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
