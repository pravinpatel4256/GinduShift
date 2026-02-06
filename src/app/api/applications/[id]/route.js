import { NextResponse } from 'next/server';
import { getApplicationById, updateApplicationStatus, getUserByEmail } from '@/lib/db';
import { sendShiftConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email';

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

        // If application is approved, send confirmation emails
        if (status === 'approved' && application) {
            try {
                // Send email to pharmacist with calendar invite
                await sendShiftConfirmationEmail(
                    application.shift,
                    application.pharmacist,
                    application.shift.owner
                );

                // Find admin user and send notification
                const adminUser = await getUserByEmail('admin@locumconnect.com');
                if (adminUser) {
                    await sendAdminNotificationEmail(
                        application.shift,
                        application.pharmacist,
                        adminUser.email
                    );
                }

                console.log('✅ Confirmation emails sent for application:', id);
            } catch (emailError) {
                // Don't fail the request if email fails
                console.error('Email error (non-fatal):', emailError);
            }
        }

        return NextResponse.json(application);
    } catch (error) {
        console.error('Update application error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
