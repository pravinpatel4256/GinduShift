import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendShiftReminderEmail } from '@/lib/email';

export async function GET(request) {
    // Verify Vercel Cron secret to prevent unauthorized execution
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        console.log(`⏰ Cron: Checking shifts for date ${todayStr}...`);

        // Find approved applications for shifts starting today
        // We look for applications (assignments), not just shifts, because we need the pharmacist
        const applications = await prisma.application.findMany({
            where: {
                status: 'approved',
                shift: {
                    startDate: todayStr
                }
            },
            include: {
                shift: { include: { owner: true } },
                pharmacist: true
            }
        });

        console.log(`   Found ${applications.length} shifts starting today.`);

        const results = [];
        for (const app of applications) {
            console.log(`   Sending reminder to ${app.pharmacist.email} for shift at ${app.shift.pharmacyName}`);
            const result = await sendShiftReminderEmail(app.shift, app.pharmacist);
            results.push({
                id: app.id,
                pharmacist: app.pharmacist.email,
                success: result.success
            });
        }

        return NextResponse.json({
            success: true,
            count: applications.length,
            results
        });

    } catch (error) {
        console.error('Cron error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
