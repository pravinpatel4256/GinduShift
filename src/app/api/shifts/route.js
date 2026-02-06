import { NextResponse } from 'next/server';
import {
    getAllShifts,
    getOpenShifts,
    getShiftsByOwner,
    getPendingReviewShifts,
    createShift,
    searchShifts
} from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const ownerId = searchParams.get('ownerId');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // If search params provided, use search function
        if (search === 'true') {
            const filters = {};
            if (searchParams.get('minRate')) filters.minRate = parseFloat(searchParams.get('minRate'));
            if (searchParams.get('maxRate')) filters.maxRate = parseFloat(searchParams.get('maxRate'));
            if (searchParams.get('minDuration')) filters.minDuration = parseInt(searchParams.get('minDuration'));
            if (searchParams.get('maxDuration')) filters.maxDuration = parseInt(searchParams.get('maxDuration'));
            if (searchParams.get('location')) filters.location = searchParams.get('location');
            if (searchParams.get('startDate')) filters.startDate = searchParams.get('startDate');
            if (searchParams.get('endDate')) filters.endDate = searchParams.get('endDate');

            const shifts = await searchShifts(filters);
            return NextResponse.json(shifts);
        }

        // If ownerId provided, get owner's shifts
        if (ownerId) {
            const shifts = await getShiftsByOwner(ownerId);
            return NextResponse.json(shifts);
        }

        // If status is pending_review, get shifts needing admin approval
        if (status === 'pending_review') {
            const shifts = await getPendingReviewShifts();
            return NextResponse.json(shifts);
        }

        // If status is open, get only open shifts
        if (status === 'open') {
            const shifts = await getOpenShifts();
            return NextResponse.json(shifts);
        }

        const shifts = await getAllShifts();
        return NextResponse.json(shifts);
    } catch (error) {
        console.error('Get shifts error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const shiftData = await request.json();
        console.log('Creating shift with data:', JSON.stringify(shiftData, null, 2));

        // Validate required fields
        if (!shiftData.ownerId) {
            return NextResponse.json({ error: 'Owner ID is required' }, { status: 400 });
        }
        if (!shiftData.startDate || !shiftData.endDate) {
            return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
        }
        if (!shiftData.location) {
            return NextResponse.json({ error: 'Location is required' }, { status: 400 });
        }

        const shift = await createShift(shiftData);
        console.log('Shift created successfully:', shift.id);
        return NextResponse.json(shift, { status: 201 });
    } catch (error) {
        console.error('Create shift error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
