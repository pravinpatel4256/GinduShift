import { NextResponse } from 'next/server';
import { getApplicationById } from '@/lib/db';
import { sendShiftReminderEmail } from '@/lib/email';
import { getUser } from '@/lib/auth';

export async function POST(request) {
    try {
        const user = await getUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { applicationId } = await request.json();

        if (!applicationId) {
            return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
        }

        const application = await getApplicationById(applicationId);

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        console.log(`🔔 Sending manual reminder for application ${applicationId} to ${application.pharmacist.email}`);

        const result = await sendShiftReminderEmail(
            application.shift,
            application.pharmacist
        );

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Reminder sent successfully' });
        } else {
            return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error sending reminder:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
