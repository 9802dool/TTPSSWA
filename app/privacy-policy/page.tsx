import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy Policy | TTPSSWA",
  description: "Privacy policy for the Trinidad and Tobago Police Service Social and Welfare Association.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#e8ecf1] pt-[var(--site-header-stack)] dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-white py-10 shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="site-container">
            <div className="mx-auto max-w-4xl">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                TTPSSWA
              </p>
              <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
                Privacy Policy
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted">
                Last updated: October 26, 2026
              </p>
            </div>
          </div>
        </div>

        <div className="site-container px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <article className="prose prose-slate max-w-none dark:prose-invert">
              <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> This privacy policy should be reviewed by legal counsel to ensure full compliance 
                  with Trinidad and Tobago&apos;s Data Protection Act 2011 and any applicable regulations.
                </p>
              </div>

              <h2>Introduction</h2>
              <p>
                The Trinidad and Tobago Police Service Social and Welfare Association (&quot;TTPSSWA,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) 
                is committed to protecting the privacy and personal information of our members and website visitors. 
                This Privacy Policy explains in plain language what information we collect, how we use it, who we share it with, 
                and your rights regarding your personal data.
              </p>

              <h2>What Information We Collect</h2>
              <h3>Member Application and Account Information</h3>
              <p>When you apply for membership or use member services, we collect:</p>
              <ul>
                <li><strong>Identity information:</strong> Full name, regimental number, rank, date of birth, sex, age</li>
                <li><strong>Contact information:</strong> Home address, email address, phone numbers (home, work, and cell)</li>
                <li><strong>Employment details:</strong> Department/division, section/station, date of enlistment, financial member status</li>
                <li><strong>Photographs:</strong> Facial photo for membership applications</li>
                <li><strong>Account credentials:</strong> Username and password (encrypted) for member portal access</li>
              </ul>

              <h3>Benefit Application Information</h3>
              <p>When you apply for benefits or services, we may collect:</p>
              <ul>
                <li><strong>Dental/Optical Grant:</strong> Receipts, invoices, and medical documentation</li>
                <li><strong>Legal Aid:</strong> Case details, court documents, incident photos, and legal correspondence</li>
                <li><strong>Merit Loan:</strong> Employment details, salary information, ID documents, payslips, and repayment information</li>
                <li><strong>Retirement Benefit:</strong> Effective retirement date, departmental orders, and health plan enrollment status</li>
                <li><strong>Salary Deduction:</strong> Authorization forms and deduction details</li>
              </ul>

              <h3>Hotel Booking Information</h3>
              <p>When you book the Noel Chase Hotel, we collect:</p>
              <ul>
                <li>Guest name, contact information, check-in and check-out dates, number of guests, and room preferences</li>
                <li>Member status (to apply applicable discounts)</li>
              </ul>

              <h3>Website Analytics</h3>
              <p>
                We collect basic website usage information through analytics tools hosted by Vercel, our website platform provider. 
                This includes pages visited, time spent on the site, browser type, and general location (country/region). 
                We use this data to improve the website experience.
              </p>

              <h2>How We Use Your Information</h2>
              <p>We use your personal information to:</p>
              <ul>
                <li>Process and manage membership applications</li>
                <li>Administer member benefits including dental/optical grants, legal aid, loans, and retirement benefits</li>
                <li>Process hotel reservations at the Noel Chase Hotel and Conference Centre</li>
                <li>Communicate with you about your applications, benefits, and association activities</li>
                <li>Send important notices via email using Resend (our email service provider)</li>
                <li>Maintain member accounts and provide secure portal access</li>
                <li>Verify member eligibility for services and partner discounts</li>
                <li>Improve our website and services</li>
                <li>Comply with legal and regulatory obligations</li>
              </ul>

              <h2>Legal Basis</h2>
              <p>
                Under Trinidad and Tobago&apos;s Data Protection Act 2011, we process your personal information based on:
              </p>
              <ul>
                <li><strong>Your consent:</strong> When you submit an application or create an account, you consent to the processing of your personal information for membership and services</li>
                <li><strong>Contractual necessity:</strong> Processing is necessary to provide membership services and benefits you have requested</li>
                <li><strong>Legal obligations:</strong> We may process data to comply with applicable laws and regulations</li>
                <li><strong>Legitimate interests:</strong> We process data for legitimate organizational purposes, such as improving services and communicating with members, while balancing your privacy rights</li>
              </ul>

              <h2>Where We Store Your Information</h2>
              <p>Your information is stored securely using the following systems:</p>
              <ul>
                <li><strong>Supabase:</strong> Cloud database service that stores application forms, member records, and uploaded documents. Data is encrypted at rest and in transit.</li>
                <li><strong>Upstash Redis:</strong> Cloud service that stores member account sessions, email verification codes, rate limiting data, and website analytics</li>
                <li><strong>Vercel:</strong> Cloud hosting platform that serves the website and provides analytics. Vercel is based in the United States and complies with international data protection standards.</li>
              </ul>
              <p>
                These services may store data outside of Trinidad and Tobago. We work with reputable providers that maintain 
                strong security standards and comply with international data protection regulations.
              </p>

              <h2>Who We Share Your Information With</h2>
              <p>We share your personal information only when necessary:</p>
              <ul>
                <li><strong>Service providers:</strong> Supabase (database), Upstash (session management and analytics), Vercel (hosting), and Resend (email delivery) process data on our behalf under strict confidentiality obligations</li>
                <li>
                  <strong>Partner organizations:</strong> When you apply for a partner benefit (such as discounts at Antar Auto Repairs And Parts 
                  or Dream Builder Colour Studio Ltd), we may share your name and member status with the partner to verify eligibility. 
                  We will only share this information when you apply for the specific partner service.
                </li>
                <li><strong>Legal authorities:</strong> We may disclose information if required by law, court order, or to protect the rights and safety of the Association and its members</li>
              </ul>
              <p>
                We <strong>do not</strong> sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>

              <h2>Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul>
                <li>Passwords are encrypted using strong cryptographic algorithms (scrypt)</li>
                <li>Data is transmitted over secure HTTPS connections</li>
                <li>Database access is restricted to authorized personnel only</li>
                <li>Member portal sessions are secured with time-limited tokens</li>
                <li>Uploaded documents are stored in secure cloud storage with access controls</li>
              </ul>
              <p>
                While we take reasonable precautions to protect your data, no internet transmission or electronic storage is 
                completely secure. We cannot guarantee absolute security but continuously work to maintain strong protections.
              </p>

              <h2>Data Retention</h2>
              <p>We retain your personal information as follows:</p>
              <ul>
                <li><strong>Active member records:</strong> Maintained for the duration of your membership and for a proposed period of 7 years after membership ends (to be confirmed by the Association), as may be required for financial and legal record-keeping</li>
                <li><strong>Application forms and documents:</strong> Retained for a proposed period of 7 years (to be confirmed by the Association) to support benefit administration and resolve any disputes</li>
                <li><strong>Hotel booking records:</strong> Retained for a proposed period of 3 years (to be confirmed by the Association) for reservation management and accounting purposes</li>
                <li><strong>Website analytics:</strong> Aggregated and anonymized data may be retained indefinitely to track trends and improve the website</li>
                <li><strong>Session and verification codes:</strong> Automatically deleted after expiry (typically 15-30 days)</li>
              </ul>
              <p>
                If you request deletion of your account, we will delete or anonymize your personal information, except where 
                we are required by law to retain records (such as financial transaction records).
              </p>

              <h2>Your Rights</h2>
              <p>Under Trinidad and Tobago&apos;s Data Protection Act 2011, you have the right to:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of any inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal and contractual obligations</li>
                <li><strong>Objection:</strong> Object to processing of your personal information for specific purposes</li>
                <li><strong>Withdraw consent:</strong> Withdraw your consent at any time (though this may affect our ability to provide services)</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information below. We will respond to your request 
                within 30 days as required by law.
              </p>

              <h2>Cookies and Tracking</h2>
              <p>
                Our website uses minimal cookies and tracking:
              </p>
              <ul>
                <li><strong>Essential cookies:</strong> Required for member login and session management. These cannot be disabled.</li>
                <li><strong>Analytics:</strong> Vercel Analytics collects anonymous website usage data to help us improve the site. No personal identifiers are collected. You can disable analytics through your browser settings.</li>
              </ul>
              <p>
                We do not use third-party advertising cookies or sell your data to advertisers.
              </p>

              <h2>Third-Party Links</h2>
              <p>
                Our website may contain links to partner organizations and external websites (such as partner business websites). 
                We are not responsible for the privacy practices of these external sites. We encourage you to read their 
                privacy policies before providing any personal information.
              </p>

              <h2>Children&apos;s Privacy</h2>
              <p>
                Our services are intended for adults and police service members. We do not knowingly collect personal information 
                from children under 18 years of age without parental consent.
              </p>

              <h2>Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
                When we make material changes, we will notify members via email or a prominent notice on our website. 
                The &quot;Last Updated&quot; date at the top of this page shows when the policy was last revised.
              </p>

              <h2>Contact Us</h2>
              <p>If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us:</p>
              <address className="not-italic">
                <strong>Trinidad and Tobago Police Service Social and Welfare Association</strong><br />
                4th Floor, Riverside Plaza<br />
                #3 Besson Street<br />
                Port of Spain<br />
                Trinidad and Tobago<br />
                <br />
                Tel: <a href="tel:+18682355260" className="text-brand hover:underline">235-5260</a> / <a href="tel:+18687926226" className="text-brand hover:underline">792-6226</a><br />
              </address>

              <h2>Governing Law</h2>
              <p>
                This Privacy Policy is governed by the Data Protection Act 2011 of the Republic of Trinidad and Tobago 
                and any applicable regulations thereunder. Any disputes regarding this policy or our data practices 
                will be subject to the jurisdiction of the courts of Trinidad and Tobago.
              </p>
            </article>

            <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-950">
              <p className="text-sm text-center text-muted">
                <Link href="/" className="font-semibold text-brand hover:underline">
                  Return to home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
