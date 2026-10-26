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
                <strong className="text-red-600">DRAFT</strong> — This privacy policy is a template for review and completion by the Association.
              </p>
            </div>
          </div>
        </div>

        <div className="site-container px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <article className="prose prose-slate max-w-none dark:prose-invert">
              <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-950">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                  <strong>IMPORTANT:</strong> This is a draft privacy policy template. The Association must review, 
                  customize, and approve this content before it becomes official. Items requiring attention are 
                  marked below.
                </p>
              </div>

              <h2>Introduction</h2>
              <p>
                The Trinidad and Tobago Police Service Social and Welfare Association (&quot;TTPSSWA,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) 
                is committed to protecting the privacy of our members and website visitors. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your personal information when you use our website and 
                services.
              </p>

              <h2>Information We Collect</h2>
              <h3>Personal Information</h3>
              <p>We may collect the following types of personal information:</p>
              <ul>
                <li><strong>Identity Data:</strong> Full name, date of birth, NIS number, regimental number</li>
                <li><strong>Contact Data:</strong> Address, email address, telephone numbers</li>
                <li><strong>Financial Data:</strong> Bank name, account number for salary deduction authorization</li>
                <li><strong>Employment Data:</strong> Station/division, rank, service details</li>
                <li><strong>Membership Data:</strong> Application forms, benefit requests, service usage</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, usage patterns</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>We use your personal information for the following purposes:</p>
              <ul>
                <li>Processing membership applications and maintaining member records</li>
                <li>Administering member benefits and services</li>
                <li>Processing salary deduction authorizations</li>
                <li>Communicating with members about services, events, and updates</li>
                <li>Maintaining and improving our website and services</li>
                <li>Complying with legal obligations and protecting our legal rights</li>
              </ul>

              <h2>Legal Basis for Processing</h2>
              <p className="text-red-600 font-semibold">
                [REQUIRES REVIEW: Legal basis should be reviewed by legal counsel to ensure compliance with 
                Trinidad and Tobago data protection laws]
              </p>
              <p>We process your personal information based on:</p>
              <ul>
                <li><strong>Consent:</strong> You have given explicit consent for membership and related services</li>
                <li><strong>Contractual Necessity:</strong> Processing is necessary to fulfill our membership obligations</li>
                <li><strong>Legal Obligation:</strong> We must comply with applicable laws and regulations</li>
                <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate organizational interests</li>
              </ul>

              <h2>Information Sharing and Disclosure</h2>
              <p>We may share your personal information with:</p>
              <ul>
                <li><strong>Service Providers:</strong> Third parties who provide services on our behalf (e.g., payment processors, IT services)</li>
                <li><strong>Financial Institutions:</strong> For processing salary deductions and member payments</li>
                <li><strong>Partner Organizations:</strong> To provide member discounts and benefits, with your consent</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our legal rights</li>
              </ul>
              <p>We do not sell or rent your personal information to third parties for marketing purposes.</p>

              <h2>Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
                over the internet or electronic storage is 100% secure.
              </p>
              <p className="text-red-600 font-semibold">
                [REQUIRES COMPLETION: Specific security measures and data protection protocols should be documented here]
              </p>

              <h2>Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this 
                Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
              <p className="text-red-600 font-semibold">
                [REQUIRES REVIEW: Specific retention periods should be defined for different types of data]
              </p>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal obligations</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Data Portability:</strong> Request transfer of your information to another organization</li>
                <li><strong>Withdraw Consent:</strong> Withdraw your consent at any time (where processing is based on consent)</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the contact information below.
              </p>

              <h2>Cookies and Tracking Technologies</h2>
              <p>
                Our website may use cookies and similar tracking technologies to enhance user experience and analyze 
                website usage. You can control cookie settings through your browser preferences.
              </p>

              <h2>Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for the privacy practices 
                or content of these external sites. We encourage you to review their privacy policies.
              </p>

              <h2>Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify members of any material changes 
                through our website or direct communication. The &quot;Last Updated&quot; date will reflect the most recent revision.
              </p>
              <p className="text-red-600 font-semibold">
                [REQUIRES COMPLETION: Add effective date once policy is approved]
              </p>

              <h2>Contact Information</h2>
              <p>If you have questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
              <address className="not-italic">
                <strong>Trinidad and Tobago Police Service Social and Welfare Association</strong><br />
                4th Floor, Riverside Plaza<br />
                #3 Besson Street<br />
                Port of Spain<br />
                Trinidad and Tobago<br />
                <br />
                Tel: <a href="tel:+18682355260">235-5260</a> / <a href="tel:+18687926226">792-6226</a><br />
              </address>
              <p className="text-red-600 font-semibold">
                [REQUIRES COMPLETION: Add email address for privacy inquiries]
              </p>

              <h2>Governing Law</h2>
              <p className="text-red-600 font-semibold">
                [REQUIRES REVIEW: Specify applicable Trinidad and Tobago laws and regulations governing data protection 
                and privacy]
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
