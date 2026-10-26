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
  const fromEmail = process.env.BOOKING_FROM_EMAIL?.trim() || 'TTPSSWA <onboarding@resend.dev>';

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
