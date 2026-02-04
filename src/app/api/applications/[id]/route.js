import { NextResponse } from 'next/server';
import { getApplicationById, updateApplicationStatus } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const application = await getApplicationById(id);

        if (!application) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(application);
    } catch (error) {
        console.error('Get application error:', error);
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

        const application = await updateApplicationStatus(id, status);
        return NextResponse.json(application);
    } catch (error) {
        console.error('Update application error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
