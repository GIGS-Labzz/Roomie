import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Roomie",
  description: "How Roomie collects, uses, and protects your personal data.",
};

const sections = [
  {
    id: "intro",
    title: "Overview",
    body: `Roomie ("we", "us", "our") is operated by GIGSRentals. This Privacy Policy explains what personal data we collect when you use Roomie, how we use it, and the choices you have. By using Roomie, you agree to the practices described here.`,
  },
  {
    id: "collect",
    title: "1. Information We Collect",
    subsections: [
      {
        label: "Information you provide",
        text: `When you sign up and complete your profile: name, age, gender, university, preferred location, budget range, lifestyle preferences, and any photos you upload.`,
      },
      {
        label: "Authentication data",
        text: `We use Google OAuth (via Supabase) to authenticate you. We receive your Google account email address and display name. We do not receive or store your Google password.`,
      },
      {
        label: "Usage data",
        text: `We collect information about how you interact with the app — pages visited, actions taken (e.g., swipes, connection requests), device type, and general location (city-level).`,
      },
      {
        label: "Payment data",
        text: `When you pay the ₦2,000 housing referral access fee, payment is processed by our payment provider. We store a record of the transaction but not your full card or bank details.`,
      },
    ],
  },
  {
    id: "use",
    title: "2. How We Use Your Information",
    body: `We use your information to: (a) create and manage your account; (b) match you with compatible potential roommates based on your preferences; (c) display your profile to other users; (d) process your connection fee payment; (e) send you relevant in-app notifications; (f) improve and personalise the Roomie experience; and (g) comply with legal obligations.`,
  },
  {
    id: "sharing",
    title: "3. Information Sharing",
    body: `We do not sell your personal data. We share information only with: (a) other Roomie users — your profile (name, photo, university, budget, lifestyle preferences) is visible to users browsing the platform; (b) service providers — Supabase (database and auth), our payment processor, and analytics tools that help us operate the platform; (c) law enforcement — if required by Nigerian law or a valid court order. We require all third-party providers to handle your data securely and only for the purpose of delivering services to us.`,
  },
  {
    id: "security",
    title: "4. Data Security",
    body: `We use industry-standard security measures including encrypted connections (HTTPS/TLS), row-level security policies in our database, and access controls. No system is completely secure; we encourage you not to share sensitive personal information (e.g., financial account details) directly with other users on the platform.`,
  },
  {
    id: "retention",
    title: "5. Data Retention",
    body: `We retain your personal data for as long as your account is active. If you delete your account, we will delete or anonymise your personal data within 30 days, except where we are required to retain it by law (e.g., payment records for tax purposes).`,
  },
  {
    id: "rights",
    title: "6. Your Rights",
    body: `You have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your account and data; withdraw consent where processing is consent-based; and lodge a complaint with the Nigeria Data Protection Commission (NDPC). To exercise any of these rights, contact us at support@gigsrentals.com.`,
  },
  {
    id: "cookies",
    title: "7. Cookies & Local Storage",
    body: `Roomie uses session cookies (set by Supabase) to keep you signed in. We also use local storage for app preferences. We do not use advertising cookies or cross-site tracking.`,
  },
  {
    id: "children",
    title: "8. Children's Privacy",
    body: `Roomie is not intended for anyone under 18. We do not knowingly collect data from minors. If we discover a user is under 18, we will delete their account and data promptly.`,
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes via in-app notice or email before the changes take effect. The "Last updated" date at the top of this page always reflects the current version.`,
  },
  {
    id: "contact",
    title: "10. Contact Us",
    body: `For privacy-related questions or requests, contact us at support@gigsrentals.com or write to GIGSRentals, Lagos, Nigeria.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-sage-surface px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ boxShadow: "0 6px 18px rgba(138,175,110,0.35)" }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-display font-semibold text-xl tracking-tight text-slate-900">
              Roomie
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-8 md:p-10">
          <div className="mb-8 pb-6 border-b border-slate-100">
            <h1 className="text-2xl font-display font-semibold tracking-tight text-slate-900 mb-1">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-400">Last updated: June 1, 2026</p>
          </div>

          <div className="space-y-7">
            {sections.map((section) => (
              <div key={section.id} id={section.id}>
                <h2 className="text-base font-semibold text-slate-800 mb-2">
                  {section.title}
                </h2>

                {section.subsections ? (
                  <ul className="space-y-3">
                    {section.subsections.map((sub) => (
                      <li key={sub.label} className="text-sm text-slate-600 leading-relaxed">
                        <span className="font-medium text-slate-700">{sub.label}: </span>
                        {sub.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed">{section.body}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>&copy; 2026 Roomie &bull; A GIGSRentals Product</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-brand-500 transition-colors">
              Terms of Service
            </Link>
            <span className="text-brand-600 font-medium">Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
