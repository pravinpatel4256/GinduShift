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
            console.log('📧 Starting email notifications for application:', id);
            console.log('   Pharmacist:', application.pharmacist?.email);
            console.log('   SMTP Host:', process.env.SMTP_HOST ? 'Configured' : 'Missing');
            console.log('   SMTP User:', process.env.SMTP_USER);
            console.log('   SMTP Pass Length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.trim().length : 0);

            try {
                // Send email to pharmacist with calendar invite
                const emailResult = await sendShiftConfirmationEmail(
                    application.shift,
                    application.pharmacist,
                    application.shift.owner
                );

                if (emailResult.success) {
                    console.log('   ✅ Pharmacist email sent successfully');
                } else {
                    console.error('   ❌ Pharmacist email failed:', emailResult.error);
                }

                // Find admin user and send notification
                // In a real app, you might have a dedicated admin email env var or database lookup
                const adminEmail = process.env.ADMIN_EMAIL || 'admin@ginduapp.com';
                // We'll just send to this email if configured, or log skipping

                // If you have a specific admin user in DB you want to notify:
                const adminUser = await getUserByEmail(adminEmail);

                if (adminUser || process.env.ADMIN_EMAIL) {
                    await sendAdminNotificationEmail(
                        application.shift,
                        application.pharmacist,
                        adminUser?.email || adminEmail
                    );
                    console.log('   ✅ Admin notification sent');
                } else {
                    console.log('   ⚠️ No admin user found for notification');
                }

            } catch (emailError) {
                // Don't fail the request if email fails
                console.error('   ❌ Critical email error:', emailError);
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
