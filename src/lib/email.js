// Email and Calendar Invite Service
// Uses nodemailer for sending emails with iCal attachments

import nodemailer from 'nodemailer';

// Create transporter - configure based on your email provider
const createTransporter = () => {
    // For production, use a real SMTP service like SendGrid, Mailgun, AWS SES, etc.
    // For development/demo, we use ethereal.email (fake email service)

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // If no SMTP configured, log to console instead
    return null;
};

// Generate iCal event content
export const generateCalendarInvite = (shift, pharmacist, owner) => {
    const startDate = new Date(`${shift.startDate}T${shift.startTime}:00`);
    const endDate = new Date(`${shift.endDate}T${shift.endTime}:00`);

    // Format dates for iCal (YYYYMMDDTHHMMSS format)
    const formatICalDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const uid = `shift-${shift.id}@locumconnect`;
    const now = formatICalDate(new Date());

    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LocumConnect//Shift Booking//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${formatICalDate(startDate)}
DTEND:${formatICalDate(endDate)}
SUMMARY:Pharmacy Shift at ${shift.pharmacyName}
DESCRIPTION:Shift Details:\\n- Location: ${shift.location}\\n- Rate: $${shift.hourlyRate}/hr\\n- Total Hours: ${shift.totalHours}\\n- Pharmacist: ${pharmacist.name}\\n\\n${shift.description || 'No additional details'}${shift.accommodationProvided ? '\\n\\nAccommodation: ' + (shift.accommodationDetails || 'Provided') : ''}${shift.mileageAllowance ? '\\n\\nMileage: $' + shift.mileageRate + '/mile' : ''}
LOCATION:${shift.location}
ORGANIZER:${owner?.name || 'Pharmacy Owner'}
ATTENDEE;CN=${pharmacist.name}:mailto:${pharmacist.email}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    return icalContent;
};

// Send shift confirmation email with calendar invite
export const sendShiftConfirmationEmail = async (shift, pharmacist, owner) => {
    const transporter = createTransporter();

    if (!transporter) {
        console.log('📧 Email would be sent (SMTP not configured):');
        console.log(`   To: ${pharmacist.email}`);
        console.log(`   Subject: Shift Confirmed - ${shift.pharmacyName}`);
        console.log(`   Dates: ${shift.startDate} to ${shift.endDate}`);
        return { success: true, mock: true };
    }

    const calendarInvite = generateCalendarInvite(shift, pharmacist, owner);

    const mailOptions = {
        from: process.env.SMTP_FROM || '"LocumConnect" <noreply@locumconnect.com>',
        to: pharmacist.email,
        subject: `✅ Shift Confirmed - ${shift.pharmacyName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0;">Shift Confirmed! 🎉</h1>
                </div>
                <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px;">
                    <p>Hi ${pharmacist.name},</p>
                    <p>Great news! Your application has been <strong>approved</strong> for the following shift:</p>
                    
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h2 style="color: #6366f1; margin-top: 0;">${shift.pharmacyName}</h2>
                        <p><strong>📍 Location:</strong> ${shift.location}</p>
                        <p><strong>📅 Dates:</strong> ${shift.startDate} to ${shift.endDate}</p>
                        <p><strong>⏰ Time:</strong> ${shift.startTime} - ${shift.endTime}</p>
                        <p><strong>💰 Rate:</strong> $${shift.hourlyRate}/hr</p>
                        <p><strong>⏱️ Total Hours:</strong> ${shift.totalHours}</p>
                        ${shift.accommodationProvided ? `<p><strong>🏨 Accommodation:</strong> ${shift.accommodationDetails || 'Provided'}</p>` : ''}
                        ${shift.mileageAllowance ? `<p><strong>🚗 Mileage:</strong> $${shift.mileageRate}/mile</p>` : ''}
                    </div>
                    
                    <p>A calendar invite is attached to this email. Accept it to add this shift to your calendar.</p>
                    
                    <p>If you have any questions, please contact the pharmacy directly.</p>
                    
                    <p>Best regards,<br>The LocumConnect Team</p>
                </div>
            </div>
        `,
        icalEvent: {
            filename: 'shift-invite.ics',
            method: 'REQUEST',
            content: calendarInvite
        }
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Send admin notification email
export const sendAdminNotificationEmail = async (shift, pharmacist, adminEmail) => {
    const transporter = createTransporter();

    if (!transporter) {
        console.log('📧 Admin notification would be sent (SMTP not configured):');
        console.log(`   To: ${adminEmail}`);
        console.log(`   Subject: New Shift Assignment - ${pharmacist.name}`);
        return { success: true, mock: true };
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || '"LocumConnect" <noreply@locumconnect.com>',
        to: adminEmail,
        subject: `📋 New Shift Assignment - ${pharmacist.name} at ${shift.pharmacyName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0;">New Assignment 📋</h1>
                </div>
                <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px;">
                    <p>A pharmacist has been approved for a shift:</p>
                    
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h3 style="color: #6366f1; margin-top: 0;">Pharmacist</h3>
                        <p><strong>Name:</strong> ${pharmacist.name}</p>
                        <p><strong>Email:</strong> ${pharmacist.email}</p>
                        ${pharmacist.licenseNumber ? `<p><strong>License:</strong> ${pharmacist.licenseNumber}</p>` : ''}
                    </div>
                    
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h3 style="color: #10b981; margin-top: 0;">Shift Details</h3>
                        <p><strong>Pharmacy:</strong> ${shift.pharmacyName}</p>
                        <p><strong>Location:</strong> ${shift.location}</p>
                        <p><strong>Dates:</strong> ${shift.startDate} to ${shift.endDate}</p>
                        <p><strong>Time:</strong> ${shift.startTime} - ${shift.endTime}</p>
                    </div>
                    
                    <p>View the <a href="${process.env.NEXTAUTH_URL}/admin/tracking">tracking page</a> for more details.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending admin email:', error);
        return { success: false, error: error.message };
    }
};
