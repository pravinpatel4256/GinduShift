import { NextResponse } from 'next/server';
import {
    getAllApplications,
    getApplicationsByShift,
    getApplicationsByPharmacist,
    getApplicationsForOwner,
    getApplicationsByStatus,
    createApplication
} from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const shiftId = searchParams.get('shiftId');
        const pharmacistId = searchParams.get('pharmacistId');
        const ownerId = searchParams.get('ownerId');
        const status = searchParams.get('status');

        if (shiftId) {
            const applications = await getApplicationsByShift(shiftId);
            return NextResponse.json(applications);
        }

        if (pharmacistId) {
            const applications = await getApplicationsByPharmacist(pharmacistId);
            return NextResponse.json(applications);
        }

        if (ownerId) {
            const applications = await getApplicationsForOwner(ownerId);
            return NextResponse.json(applications);
        }

        if (status) {
            const applications = await getApplicationsByStatus(status);
            return NextResponse.json(applications);
        }

        const applications = await getAllApplications();
        return NextResponse.json(applications);
    } catch (error) {
        console.error('Get applications error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const applicationData = await request.json();
        const result = await createApplication(applicationData);

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 409 }
            );
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Create application error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
