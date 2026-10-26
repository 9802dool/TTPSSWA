import { Resend } from "resend";
import type { ApplicationType, ApplicationStatus } from "./supabase/types";

const APPLICATION_TYPE_LABELS: Record<string, string> = {
  membership_signup: "Membership Signup",
  formal_membership: "Formal Membership",
  dental_optical_grant: "Dental/Optical Grant",
  legal_aid_application: "Legal Aid Application",
  merit_loan_application: "Merit Loan Application",
  retirement_benefit_application: "Retirement Benefit Application",
  salary_deduction: "Salary Deduction Authorization",
  merit_salary_deduction: "Merit Salary Deduction Authorization",
  hotel_booking: "Hotel Booking",
};

interface StatusChangeEmailParams {
  to: string;
  applicantName: string;
  applicationType: ApplicationType;
  oldStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  note?: string;
  adminNotes?: string;
}

export async function sendStatusChangeEmail(params: StatusChangeEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = 
    process.env.BOOKING_FROM_EMAIL?.trim() || 
    'TTPSSWA <noreply@ttpsswa.org>';

  if (!apiKey) {
    console.log('Email not configured (RESEND_API_KEY missing), skipping notification');
    return;
  }

  const resend = new Resend(apiKey);
  const typeLabel = APPLICATION_TYPE_LABELS[params.applicationType] || params.applicationType;
  const statusLabel = params.newStatus.replace('_', ' ').toUpperCase();

  const subject = `TTPSSWA Application Update: ${statusLabel}`;
  
  let emailBody = `Dear ${params.applicantName},\n\n`;
  emailBody += `Your ${typeLabel} application status has been updated.\n\n`;
  emailBody += `Previous Status: ${params.oldStatus.replace('_', ' ')}\n`;
  emailBody += `New Status: ${params.newStatus.replace('_', ' ')}\n\n`;

  if (params.note) {
    emailBody += `Note: ${params.note}\n\n`;
  }

  if (params.adminNotes) {
    emailBody += `Administrator Message:\n${params.adminNotes}\n\n`;
  }

  emailBody += `You can view your application details at: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://ttpsswa.vercel.app'}/member/dashboard\n\n`;
  emailBody += `If you have any questions, please contact the TTPSSWA office.\n\n`;
  emailBody += `Best regards,\nTTPSSWA Administration`;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: [params.to],
      subject,
      text: emailBody,
    });
  } catch (error) {
    console.error('Email send error:', error);
    // Silent failure - don't block the status update
  }
}

interface AdminNotificationParams {
  applicationType: ApplicationType;
  applicantName: string;
  applicantEmail: string;
  applicantServiceNumber: string;
  applicationId: string;
}

/**
 * Send admin notification email about a new application submission.
 * Emails are sent to ADMIN_NOTIFY_EMAIL (comma-separated), falling back to HOTEL_BOOKING_NOTIFY_EMAIL.
 * Failures are logged but do not throw - submission must always succeed.
 */
export async function sendAdminNotification(params: AdminNotificationParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.BOOKING_FROM_EMAIL?.trim() || 'TTPSSWA <noreply@ttpsswa.org>';
  
  // Get admin email list
  const adminEmailsRaw = 
    process.env.ADMIN_NOTIFY_EMAIL?.trim() || 
    process.env.HOTEL_BOOKING_NOTIFY_EMAIL?.trim();
  
  if (!apiKey || !adminEmailsRaw) {
    console.log('Admin notification not configured (missing RESEND_API_KEY or ADMIN_NOTIFY_EMAIL/HOTEL_BOOKING_NOTIFY_EMAIL)');
    return;
  }

  const adminEmails = adminEmailsRaw
    .split(',')
    .map(e => e.trim())
    .filter(e => e.length > 0);

  if (adminEmails.length === 0) {
    console.log('No valid admin emails configured');
    return;
  }

  const resend = new Resend(apiKey);
  const typeLabel = APPLICATION_TYPE_LABELS[params.applicationType] || params.applicationType;
  const subject = `New Application: ${typeLabel}`;
  
  const emailBody = [
    'A new application has been submitted.',
    '',
    `Application Type: ${typeLabel}`,
    `Applicant Name: ${params.applicantName}`,
    `Email: ${params.applicantEmail}`,
    `Service Number: ${params.applicantServiceNumber}`,
    `Application ID: ${params.applicationId}`,
    '',
    `View application: https://ttpsswa.vercel.app/admin/applications`,
    '',
    'TTPSSWA Admin System',
  ].join('\n');

  try {
    await resend.emails.send({
      from: fromEmail,
      to: adminEmails,
      subject,
      text: emailBody,
    });
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    // Silent failure - don't block the submission
  }
}

interface ApplicantConfirmationParams {
  applicationType: ApplicationType;
  applicantName: string;
  applicantEmail: string;
  applicationId: string;
}

/**
 * Send confirmation email to applicant after successful submission.
 * Failures are logged but do not throw - submission must always succeed.
 */
export async function sendApplicantConfirmation(params: ApplicantConfirmationParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.BOOKING_FROM_EMAIL?.trim() || 'TTPSSWA <noreply@ttpsswa.org>';

  if (!apiKey) {
    console.log('Email not configured (RESEND_API_KEY missing), skipping confirmation');
    return;
  }

  const resend = new Resend(apiKey);
  const typeLabel = APPLICATION_TYPE_LABELS[params.applicationType] || params.applicationType;
  const subject = `TTPSSWA Application Received: ${typeLabel}`;
  
  const emailBody = [
    `Dear ${params.applicantName},`,
    '',
    `We have received your ${typeLabel} application.`,
    '',
    `Reference ID: ${params.applicationId}`,
    '',
    'Your application is being reviewed by our staff. You will be contacted when a decision has been made.',
    '',
    'If you have any questions, please contact the TTPSSWA office.',
    '',
    'Best regards,',
    'TTPSSWA Administration',
  ].join('\n');

  try {
    await resend.emails.send({
      from: fromEmail,
      to: [params.applicantEmail],
      subject,
      text: emailBody,
    });
  } catch (error) {
    console.error('Failed to send applicant confirmation:', error);
    // Silent failure - don't block the submission
  }
}
