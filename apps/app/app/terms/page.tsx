import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Roomie",
  description: "Roomie's Terms of Service for the roommate-matching platform.",
};

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    body: `By creating an account or using Roomie, you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree, do not use the platform. These Terms form a binding legal agreement between you and Roomie (operated by GIGSRentals).`,
  },
  {
    id: "service",
    title: "2. The Service",
    body: `Roomie is a roommate-matching platform that connects individuals seeking shared living arrangements in Nigeria. We facilitate introductions between potential roommates and provide access to housing referral listings. We are not a real-estate agent, landlord, or guarantor of any housing arrangement.`,
  },
  {
    id: "eligibility",
    title: "3. Eligibility",
    body: `You must be at least 18 years old to use Roomie. By using the platform, you confirm that you are 18 or older, that you are a human (not a bot or automated system), and that your use of Roomie does not violate any applicable laws.`,
  },
  {
    id: "accounts",
    title: "4. User Accounts",
    body: `You are responsible for maintaining the security of your account. You agree to provide accurate, current, and complete information during onboarding and to keep your profile up to date. You must not share your account or allow others to access it on your behalf.`,
  },
  {
    id: "connection-fee",
    title: "5. Connection Fee",
    body: `Roomie charges a one-time fee of ₦2,000 to unlock access to housing referral listings. This fee grants you access to vetted housing leads — it is not a charge for connecting with another user or for messaging. The fee is non-refundable once housing referral access has been granted. Roomie reserves the right to adjust pricing at any time; changes will be communicated in advance.`,
  },
  {
    id: "user-content",
    title: "6. User Content",
    body: `You retain ownership of content you submit (profile photos, bios, preferences). By submitting content, you grant Roomie a non-exclusive, worldwide, royalty-free licence to display and distribute that content within the platform. You represent that you own or have the right to share all content you submit, and that it does not violate any third-party rights.`,
  },
  {
    id: "prohibited",
    title: "7. Prohibited Conduct",
    body: `You agree not to: (a) use Roomie for any unlawful purpose; (b) post false, misleading, or fraudulent information; (c) harass, threaten, or abuse other users; (d) solicit money, goods, or services outside of Roomie's intended purpose; (e) attempt to reverse-engineer, scrape, or exploit the platform; (f) create multiple accounts to circumvent restrictions; or (g) impersonate any person or entity. Violations may result in immediate account suspension.`,
  },
  {
    id: "disclaimer",
    title: "8. Disclaimer of Warranties",
    body: `Roomie is provided "as is" without warranties of any kind. We do not verify the identity, background, or intentions of any user. You are solely responsible for your own safety and for conducting your own due diligence before meeting or entering into any arrangement with another user.`,
  },
  {
    id: "liability",
    title: "9. Limitation of Liability",
    body: `To the maximum extent permitted by law, Roomie and GIGSRentals shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including disputes between users, housing arrangements that do not work out, or any loss or damage suffered in connection with a referral.`,
  },
  {
    id: "termination",
    title: "10. Termination",
    body: `We may suspend or terminate your account at any time if you violate these Terms or if we reasonably suspect fraudulent or harmful activity. You may delete your account at any time from your profile settings. Upon termination, your right to access the platform ceases; these Terms otherwise survive termination to the extent required.`,
  },
  {
    id: "governing-law",
    title: "11. Governing Law",
    body: `These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos State, Nigeria.`,
  },
  {
    id: "changes",
    title: "12. Changes to Terms",
    body: `We may update these Terms from time to time. We will notify you of material changes via the app or by email. Continued use of Roomie after changes take effect constitutes your acceptance of the revised Terms.`,
  },
  {
    id: "contact",
    title: "13. Contact",
    body: `Questions about these Terms? Reach us at support@gigsrentals.com or through the in-app Help section.`,
  },
];

export default function TermsPage() {
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
            href="/auth/signin"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-8 md:p-10">
          <div className="mb-8 pb-6 border-b border-slate-100">
            <h1 className="text-2xl font-display font-semibold tracking-tight text-slate-900 mb-1">
              Terms of Service
            </h1>
            <p className="text-sm text-slate-400">Last updated: June 1, 2026</p>
          </div>

          <div className="space-y-7">
            {sections.map((section) => (
              <div key={section.id} id={section.id}>
                <h2 className="text-base font-semibold text-slate-800 mb-2">
                  {section.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>&copy; 2026 Roomie &bull; A GIGSRentals Product</p>
          <div className="flex items-center gap-4">
            <span className="text-brand-600 font-medium">Terms</span>
            <Link href="/privacy" className="hover:text-brand-500 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
