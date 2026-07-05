import Link from "next/link";
import { ArrowLeft, Download, FileText, Gavel } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Roomie",
  description: "Roomie's Terms of Service for our roommate-matching and housing referral platform.",
};

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms & Relationship with Operator",
    body: "Welcome to Roomie (the \"Platform\" or \"Service\"), operated by GIGSRentals (\"we\", \"us\", or \"our\"). By downloading, accessing, browsing, or creating an account on the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service (\"Terms\") in their entirety, alongside our Privacy Policy. If you do not agree to these Terms, you must immediately cease all access and use of our Platform. These Terms constitute a legally binding agreement between you, as a user of the Platform, and GIGSRentals.",
  },
  {
    id: "service",
    title: "2. The Roomie Platform Service Description",
    body: "Roomie provides a roommate-matching and housing referral application designed to facilitate connections between individuals seeking shared living accommodations, primarily within Nigeria. We act solely as a technology provider that provides (a) compatibility profiling to facilitate peer introductions and (b) curated listing database access for housing referrals. To assist with platform onboarding, direct support, and security alerts, all user accounts are automatically connected to the official support account (Roomie.app) upon registration. This connection is default and non-removable. You acknowledge and agree that GIGSRentals is NOT a real estate agent, housing broker, property manager, landlord, or guarantor of any accommodation. We do not own, manage, lease, inspect, or endorse any properties listed on the platform, nor do we inspect or verify the character, background, or physical properties of the users.",
  },
  {
    id: "eligibility",
    title: "3. Eligibility and User Verification",
    body: "To access and use Roomie, you must be a natural person who is at least eighteen (18) years of age. By registering, you warrant that you are at least 18 years old, possess the legal capacity to enter into binding agreements under Nigerian law, and are registering solely for roommate matching and housing coordination. You agree to provide true, accurate, current, and complete details on your profile and to complete the Google OAuth registration process securely. GIGSRentals does not guarantee or perform background checks, crime checks, or financial audits on users. Roomie is restricted to human users; any account created by bots or automated tools will be deleted immediately.",
  },
  {
    id: "fees",
    title: "4. Fees, Payments, and Refund Policy",
    body: "Access to standard search tools is free. However, Roomie charges a one-time, non-refundable platform access fee of ₦2,000 (Two Thousand Naira) to unlock access to our housing referral listings database. All transactions are securely processed through third-party payment gateways (including Paystack or Flutterwave). GIGSRentals does not store or process payment card details directly. This fee is strictly for housing database access, and payment does not guarantee that you will successfully secure housing or match with a roommate. All payments are final and completely non-refundable once listing access is unlocked on your account.",
  },
  {
    id: "conduct",
    title: "5. Prohibited Conduct and System Integrity",
    body: "Users are strictly prohibited from engaging in any behavior that degrades the safety, integrity, or functionality of the Platform. Prohibited conduct includes, but is not limited to: (a) posting false, deceptive, or misleading listing information; (b) creating duplicate profiles or impersonating other individuals or entities; (c) soliciting money, loans, bank details, or commercial transactions from other users; (d) harassing, threatening, stalking, or discriminating against other users on any grounds; (e) scraping, crawling, indexing, or reverse-engineering any portion of our database or source code; and (f) uploading files containing malware or software designed to disrupt operations. Violators are subject to immediate termination without refund.",
  },
  {
    id: "safety",
    title: "6. Safety Guidelines and Personal Responsibility",
    body: "You acknowledge that matching with roommates and coordinate housing involves inherent personal safety risks. You are solely responsible for your own safety and interactions. You agree to follow the safety protocols recommended by Roomie: (a) always conduct initial communications within the app; (b) meet potential roommates in public, well-lit spaces; (c) inform friends or family members of your location before meetings; (d) inspect physical properties in daylight and in the company of a trusted companion; and (e) never transfer deposits or rental payments to landlords or roommates without verified written agreements and verification of physical property ownership.",
  },
  {
    id: "disputes",
    title: "7. Disputes Between Users and Roommates",
    body: "GIGSRentals is not a party to any contract, sublease, roommate agreement, or verbal commitment made between Platform users or between users and third-party housing providers. If a roommate arrangement fails, or if a landlord breaches a tenancy agreement, you acknowledge that all claims must be directed solely to the relevant counterparty. GIGSRentals will not act as a mediator, arbitrator, or witness in user-to-user or user-to-landlord disputes, and disclaims all liability for any financial or residential damages resulting from such arrangements.",
  },
  {
    id: "warranties",
    title: "8. Disclaimer of Warranties",
    body: "Roomie is provided strictly on an \"as is\" and \"as available\" basis without warranties of any kind, whether express, implied, or statutory. GIGSRentals makes no warranties regarding: (a) the compatibility, behavior, or character of any roommate matching on the Platform; (b) the availability, safety, suitability, legality, or cleanliness of any housing referral listings; (c) the continuous, uninterrupted, or secure access to the Platform; or (d) the truthfulness of user profiles. To the maximum extent permitted by law, we disclaim all warranties including merchantability and fitness for a particular purpose.",
  },
  {
    id: "liability",
    title: "9. Limitation of Liability & Indemnification",
    body: "To the maximum extent permitted by applicable law, GIGSRentals, its parent companies, subsidiaries, directors, officers, employees, or agents shall not be liable for any direct, indirect, special, incidental, punitive, or consequential damages. This includes, without limitation, loss of profits, loss of data, property damage, personal injury, emotional distress, or financial losses arising out of or in connection with: (a) your use or inability to use the Platform; (b) your interactions, meetups, or shared living arrangements with other users; or (c) any listing or accommodation obtained through referrals. You agree to indemnify, defend, and hold GIGSRentals harmless from any claims, suits, or liabilities arising from your violation of these Terms.",
  },
  {
    id: "arbitration",
    title: "10. Governing Law and Arbitration",
    body: "These Terms, and all claims or disputes arising out of or relating to them, shall be governed by, construed, and enforced in accordance with the laws of the Federal Republic of Nigeria. In the event of a dispute, controversy, or claim arising out of or relating to these Terms, the parties shall first attempt to resolve it amicably through negotiation for a minimum of thirty (30) days. Any dispute that remains unresolved shall be referred to and finally resolved by binding arbitration in Lagos State, Nigeria, in accordance with the Arbitration and Mediation Act, 2023. The arbitration proceedings shall be conducted in English by a single arbitrator appointed by agreement of both parties or, failing agreement, by the Lagos Court of Arbitration.",
  },
  {
    id: "ip",
    title: "11. Intellectual Property Rights",
    body: "All intellectual property rights in the Platform, including but not limited to our brand names, trademarks, logo designs, graphics, user interface layouts, software code, database structures, and copywriting, are exclusively owned by GIGSRentals or our licensors. You are granted a limited, personal, non-transferable, revocable licence to access and use the Platform for your personal, non-commercial use only. Any unauthorized copy, reproduction, modification, distribution, or scraping of our platform assets is strictly prohibited.",
  },
  {
    id: "termination",
    title: "12. Account Termination",
    body: "We reserve the right, in our sole discretion and without notice or liability, to suspend, disable, or terminate your account and block your access to the Platform if we determine that: (a) you have violated any provision of these Terms; (b) you have engaged in fraudulent, misleading, or abusive activities; (c) you pose a safety risk to other users; or (d) we are required to do so under Nigerian law. You may delete your account at any time through your Profile Settings.",
  },
  {
    id: "changes",
    title: "13. Amendments to Terms",
    body: "GIGSRentals reserves the right to amend, update, or modify these Terms at any time. When we make material changes, we will post the revised Terms on the Platform and update the \"Last updated\" date. Your continued access or use of the Platform after changes take effect constitutes your binding acceptance of the updated Terms.",
  },
  {
    id: "contact",
    title: "14. Contact Information",
    body: "If you have any questions, feedback, or legal inquiries concerning these Terms, please contact us by email at support@gigsrentals.com or write us at: Legal & Compliance Department, GIGSRentals, Lagos, Nigeria.",
  },
];

export default function TermsPage() {
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
                <Gavel className="w-5 h-5 text-white" />
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
              href="/terms.pdf"
              download="Roomie_Terms_of_Service.pdf"
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
                Terms of Service
              </h1>
              <p className="text-sm text-slate-400 font-medium">Agreement Scope: Nigeria Legal Framework</p>
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
              <FileText className="w-3.5 h-3.5 text-brand-600" />
              Document Sections
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {sections.map((sec) => (
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
                <p className="text-sm text-slate-600 leading-relaxed justify-start text-justify whitespace-pre-line ml-4">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 px-2 font-medium">
          <p>© 2026 Roomie • A GIGSRentals Product</p>
          <div className="flex items-center gap-4">
            <span className="text-brand-500 font-semibold">Terms of Service</span>
            <Link href="/privacy" className="hover:text-brand-600 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
