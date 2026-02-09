import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingConfirmationParams {
  to: string;
  guestName: string;
  hostName: string;
  eventTitle: string;
  dateTime: string;
  meetLink?: string | null;
}

export async function sendBookingConfirmation({
  to,
  guestName,
  hostName,
  eventTitle,
  dateTime,
  meetLink,
}: BookingConfirmationParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set, skipping email');
    return null;
  }

  const meetSection = meetLink
    ? `
    <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #166534;">Google Meet Link</p>
      <a href="${meetLink}" style="color: #16a34a; text-decoration: none;">${meetLink}</a>
    </div>`
    : '';

  try {
    const { data, error } = await resend.emails.send({
      from: 'Meet Scheduler <onboarding@resend.dev>',
      to: [to],
      subject: `Booking Confirmed: ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #10b981; margin: 0;">Booking Confirmed!</h1>
          </div>

          <p>Hi ${guestName},</p>

          <p>Your booking with <strong>${hostName}</strong> has been confirmed.</p>

          <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #10b981;">
            <h2 style="margin: 0 0 16px 0; font-size: 18px;">${eventTitle}</h2>
            <p style="margin: 0; font-size: 16px;">
              <strong>📅 Date & Time:</strong><br>
              ${dateTime}
            </p>
          </div>

          ${meetSection}

          <p style="color: #666; font-size: 14px;">
            If you need to cancel or reschedule, please contact the host directly.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Sent by Meet Scheduler
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
}

interface BookingNotificationParams {
  to: string;
  hostName: string;
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  dateTime: string;
}

export async function sendBookingNotificationToHost({
  to,
  hostName,
  guestName,
  guestEmail,
  eventTitle,
  dateTime,
}: BookingNotificationParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set, skipping email');
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Meet Scheduler <onboarding@resend.dev>',
      to: [to],
      subject: `New Booking: ${guestName} - ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #10b981; margin: 0;">New Booking!</h1>
          </div>

          <p>Hi ${hostName},</p>

          <p>You have a new booking for <strong>${eventTitle}</strong>.</p>

          <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="margin: 0 0 12px 0;">
              <strong>👤 Guest:</strong> ${guestName}<br>
              <strong>📧 Email:</strong> <a href="mailto:${guestEmail}">${guestEmail}</a>
            </p>
            <p style="margin: 0;">
              <strong>📅 Date & Time:</strong><br>
              ${dateTime}
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Sent by Meet Scheduler
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
}
