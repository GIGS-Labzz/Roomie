import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck, Cookie } from "lucide-react";
import { ResetCookieConsent } from "./ResetCookieConsent";

export const metadata = {
  title: "Privacy Policy — Roomie",
  description: "How Roomie collects, uses, and protects your personal data in compliance with NDPA 2023.",
};

const sections = [
  {
    id: "intro",
    title: "Overview",
    body: "Roomie (\"we\", \"us\", or \"our\") is owned and operated by GIGSRentals. We are committed to protecting your privacy and safeguarding your personal data. This Privacy Policy details how we collect, process, share, and protect your information when you access or use the Roomie platform. Under the Nigeria Data Protection Act (NDPA) 2023, GIGSRentals is the primary Data Controller. By creating an account or using Roomie, you explicitly consent to the collection, storage, and processing of your personal data as outlined in this policy.",
  },
  {
    id: "lawful-bases",
    title: "1. Lawful Bases for Processing Data",
    body: "In compliance with Section 25 of the Nigeria Data Protection Act (NDPA) 2023, we only process your personal data under the following lawful bases: (a) Consent: where you have given explicit consent (e.g., uploading profile photos, completing matching bios); (b) Contractual Performance: processing necessary to provide our matchmaking services and fulfill our transaction obligations (e.g. processing the ₦2,000 listing fee); (c) Legal Obligation: compliance with tax laws, fraud prevention, and law enforcement directives; and (d) Legitimate Interests: security audits, spam prevention, and improving matching algorithms.",
  },
  {
    id: "collect",
    title: "2. Information We Collect",
    subsections: [
      {
        label: "A. Profile and Registration Information",
        text: "Includes your full name, email address, phone number, age, gender, university, matriculation year (or enrollment status), profile photograph, roommate lifestyle preferences (sleeping schedule, cleanliness rating, smoking/drinking habits, budget range, and desired locations).",
      },
      {
        label: "B. Authentication Data",
        text: "We utilize secure Google OAuth via Supabase for registration and login. We receive your verified email, display name, and avatar from your Google account. We do not collect or store your Google password.",
      },
      {
        label: "C. Financial Transactions",
        text: "When you purchase access to housing listings, all payments are managed by Paystack or Flutterwave. We do not store credit card or bank account details. We collect and store only transaction references, timestamps, payment success status, and transaction amounts.",
      },
      {
        label: "D. Technical and Usage Data",
        text: "Includes IP address, browser type, device type, operating system version, page view durations, matching swipes, message logs, and broad geographic locations (city-level).",
      },
      {
        label: "E. Roommate Passports & Connection Data",
        text: "When roommate agreements are confirmed, we generate a unique joint Roomie ID representing the verified roommate pair. We also record customizable roommate badge themes (color, variants, style choices) set by the roommates to distinguish their connection.",
      },
    ],
  },
  {
    id: "use",
    title: "3. How We Use Your Personal Data",
    body: "We process your personal information to deliver a secure and optimized roommate-matching experience, specifically to: (a) register and maintain your secure user profile; (b) compute compatibility scores and display profiles to matching candidates; (c) process transaction fees and grant database permissions; (d) send you notifications regarding connection requests or platform updates; (e) monitor, detect, and prevent fraudulent listings, scams, and policy violations; (f) conduct server diagnostic checks and optimize layout displays; (g) automatically connect your account to our official support account (Roomie.app) upon registration for direct customer support, system notifications, and platform onboarding; and (h) fulfill mandatory tax and regulatory filings under Nigerian law.",
  },
  {
    id: "sharing",
    title: "4. Information Sharing and Disclosure",
    body: "We do not sell, rent, or trade your personal data to third-party advertisers. Your information is disclosed only in the following scenarios: (a) Platform Users: your profile name, university, budget, age, lifestyle preferences, and bio are viewable by registered Roomie users looking for roommates; (b) Service Providers: we share data with cloud infrastructure provider Supabase (database storage), Vercel (web hosting), and payment gateways (Paystack/Flutterwave) strictly to deliver platform features; (c) Group Companies: with GIGSRentals affiliates to coordinate housing services; (d) Partner Housing Platforms: when you choose to browse housing under a confirmed roommate connection, we share the unique joint Roomie ID (representing the roommate agreement), your profile details, and the profile details of your roommate with the selected housing provider to establish a joint/dual renter profile and shared credibility passport; and (e) Legal Mandate: to Nigerian law enforcement agencies or courts if requested under a valid warrant or subpoena.",
  },
  {
    id: "transfers",
    title: "5. International Data Transfers",
    body: "Your personal data is stored on cloud servers hosted by our service providers (e.g. Supabase, Vercel) which may be located in the United States or the European Union. In compliance with Section 41-43 of the Nigeria Data Protection Act (NDPA) 2023, we ensure that these cross-border transfers are protected using Standard Contractual Clauses (SCCs) and encryption standards that guarantee an equivalent level of security for your data, as mandated by the Nigeria Data Protection Commission (NDPC).",
  },
  {
    id: "security",
    title: "6. Data Security Measures",
    body: "We implement robust administrative, technical, and physical security measures to protect your personal data against unauthorized access, loss, or manipulation. These measures include: (a) database Row-Level Security (RLS) policies ensuring users can only read authorized records; (b) complete transit encryption via HTTPS/TLS 1.3; (c) tokenized OAuth login protocols; and (d) restricted backend access limits for staff. However, no internet-based service is completely secure; we advise against transmitting highly sensitive personal credentials (such as bank details) to other users in platform chat rooms.",
  },
  {
    id: "retention",
    title: "7. Data Retention and Deletion",
    body: "We retain your profile data as long as your account is active and necessary for matchmaking. If you submit a request to delete your account via profile settings, we will permanently delete or anonymize your personal data within thirty (30) days from our active databases. We will retain transaction and invoice data for a period of seven (7) years to comply with Nigerian corporate tax regulations, after which it will be purged.",
  },
  {
    id: "rights",
    title: "8. Your Legal Rights under NDPA",
    body: "Under the Nigeria Data Protection Act (NDPA) 2023 and NDPR, you possess specific, enforceable rights over your data. These include the right to: (a) request access to the personal data we hold about you; (b) request correction of inaccurate or incomplete profile records; (c) request deletion of your account and related profile details; (d) object to processing or request restrictions under certain conditions; (e) receive your data in a structured, machine-readable format (data portability); and (f) withdraw consent at any time. To exercise these rights, please email our Data Protection Officer at support@gigsrentals.com. If you believe your data has been handled unlawfully, you have the right to lodge a formal complaint with the Nigeria Data Protection Commission (NDPC).",
  },
  {
    id: "cookies",
    title: "9. Cookie Audit and Consent Management",
    subsections: [
      {
        label: "A. Necessary Cookies",
        text: "We use first-party session cookies set by Supabase to verify your authentication state, ensure session persistence, and protect against Cross-Site Request Forged (CSRF) attacks. These are essential and cannot be opted out.",
      },
      {
        label: "B. Analytics Cookies",
        text: "These help us measure website traffic, visitor demographics, and user behavior. We load these analytics scripts (e.g. Google Analytics) only after you grant consent via our Cookie Banner.",
      },
      {
        label: "C. Preference & Functional Cookies",
        text: "Used to store your app customizations, such as sidebar state, layout choices, and onboarding step records.",
      },
    ],
  },
  {
    id: "dpo",
    title: "10. Data Protection Officer (DPO)",
    body: "We have designated a Data Protection Officer to oversee our privacy framework. If you have questions, complaints, or wish to exercise your rights, please address your inquiries to: Data Protection Officer, GIGSRentals Legal Dept, Lagos, Nigeria, or email support@gigsrentals.com.",
  },
  {
    id: "changes",
    title: "11. Updates to This Policy",
    body: "We may modify this Privacy Policy from time to time to reflect changes in regulatory standards or Platform updates. We will notify you of any material updates via an in-app banner, email, or a prominent notice on the home page prior to the modifications taking effect. The \"Last updated\" date at the top of the policy page will indicate when changes were last implemented.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-sage-surface py-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div
                className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ boxShadow: "0 6px 20px rgba(138,175,110,0.3)" }}
              >
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-slate-900">
                Roomie
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            
            <a
              href="/privacy.pdf"
              download="Roomie_Privacy_Policy.pdf"
              className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </a>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-[32px] border border-slate-200/50 shadow-[0_8px_40px_rgba(0,0,0,0.04)] p-8 sm:p-12">
          <div className="mb-10 pb-8 border-b border-slate-100 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900 mb-2">
                Privacy Policy
              </h1>
              <p className="text-sm text-slate-400 font-medium">Compliance: NDPA 2023 & NDPR 2019</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-brand-50 text-brand-700 text-xs px-3 py-1 rounded-full font-semibold">
                Last updated: July 1, 2026
              </span>
            </div>
          </div>

          {/* Table of Contents Quick Links */}
          <div className="mb-10 bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Cookie className="w-3.5 h-3.5 text-brand-600" />
              Document Sections
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {sections.map((sec, index) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="text-slate-600 hover:text-brand-600 font-medium transition-colors hover:underline"
                >
                  {sec.title}
                </a>
              ))}
            </div>
          </div>

          {/* Legal Text Sections */}
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-6">
                <h2 className="text-lg font-display font-semibold text-slate-800 border-l-4 border-brand-500 pl-3 mb-3">
                  {section.title}
                </h2>

                {section.subsections ? (
                  <div className="space-y-4 ml-4">
                    {section.subsections.map((sub) => (
                      <div key={sub.label} className="text-sm text-slate-600 leading-relaxed">
                        <h4 className="font-semibold text-slate-700 mb-1">{sub.label}</h4>
                        <p>{sub.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed justify-start text-justify whitespace-pre-line ml-4">
                    {section.body}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Cookie Preferences resets */}
          <div className="mt-12 pt-8 border-t border-slate-100 bg-brand-50/30 rounded-2xl p-6 border border-brand-100/50">
            <h3 className="font-display font-semibold text-slate-900 text-sm mb-1">
              Your Cookie Consent Choices
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              You can adjust or revoke your cookie approvals (Essential, Analytics, Preferences) at any time. Clicking the button below resets your choice and allows you to customize them again.
            </p>
            <ResetCookieConsent />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 px-2 font-medium">
          <p>© 2026 Roomie • A GIGSRentals Product</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-brand-600 transition-colors">
              Terms of Service
            </Link>
            <span className="text-brand-500">Privacy Policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
