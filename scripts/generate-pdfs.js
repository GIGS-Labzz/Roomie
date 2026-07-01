const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Define destinations
const DESTINATIONS = [
  path.join(__dirname, '..', 'apps', 'web', 'public'),
  path.join(__dirname, '..', 'apps', 'app', 'public')
];

// Ensure public directories exist
DESTINATIONS.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper function to create PDF
function buildPDF(filename, title, sections, dateStr) {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    bufferPages: true
  });

  const streams = DESTINATIONS.map(dir => {
    const filePath = path.join(dir, filename);
    return fs.createWriteStream(filePath);
  });

  // Pipe to all write streams
  doc.on('data', (chunk) => {
    streams.forEach(stream => stream.write(chunk));
  });
  doc.on('end', () => {
    streams.forEach(stream => stream.end());
    console.log(`Successfully generated ${filename} for all workspaces.`);
  });

  // Document Styling Constants
  const sageColor = '#8AAF6E';
  const darkSageColor = '#2F4220';
  const textColor = '#1E293B';
  const linkColor = '#72964D';

  // --- Title Page Header ---
  doc.fillColor(sageColor)
     .fontSize(28)
     .font('Helvetica-Bold')
     .text('Roomie', { align: 'left' });
  
  doc.fillColor('#64748B')
     .fontSize(10)
     .font('Helvetica')
     .text('A GIGSRentals Product', { align: 'left' })
     .moveDown(1.5);

  doc.strokeColor('#E2E8F0')
     .lineWidth(1)
     .moveTo(50, 100)
     .lineTo(545, 100)
     .stroke();

  doc.moveDown(2);

  // Main Page Title
  doc.fillColor(darkSageColor)
     .fontSize(22)
     .font('Helvetica-Bold')
     .text(title, { align: 'left' });

  doc.fillColor('#64748B')
     .fontSize(10)
     .font('Helvetica-Oblique')
     .text(`Last updated: ${dateStr}`, { align: 'left' })
     .moveDown(2);

  // --- Content Loop ---
  sections.forEach((sec) => {
    // Section Header
    doc.fillColor(darkSageColor)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(sec.title, { align: 'left' })
       .moveDown(0.5);

    // Section Body (or Subsections)
    if (sec.body) {
      doc.fillColor(textColor)
         .fontSize(9.5)
         .font('Helvetica')
         .text(sec.body, {
           align: 'justify',
           lineGap: 4.5,
           paragraphGap: 10
         });
    }

    if (sec.subsections) {
      sec.subsections.forEach(sub => {
        doc.fillColor(textColor)
           .fontSize(9.5)
           .font('Helvetica-Bold')
           .text(sub.label + ': ', {
             continued: true
           })
           .font('Helvetica')
           .text(sub.text, {
             align: 'justify',
             lineGap: 4.5,
             paragraphGap: 8
           });
      });
    }

    doc.moveDown(1.5);
  });

  // --- Footer Setup (Executed on end, using bufferPages) ---
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);

    // Bottom border line
    doc.strokeColor('#E2E8F0')
       .lineWidth(1)
       .moveTo(50, 780)
       .lineTo(545, 780)
       .stroke();

    // Footer text
    doc.fillColor('#94A3B8')
       .fontSize(8)
       .font('Helvetica')
       .text('© 2026 Roomie. All rights reserved. Operated by GIGSRentals, Lagos, Nigeria.', 50, 790, {
         align: 'left',
         width: 400
       });

    // Page Number right-aligned
    doc.text(`Page ${i + 1} of ${range.count}`, 450, 790, {
      align: 'right',
      width: 95
    });
  }

  doc.end();
}

// ==========================================
// DATA: TERMS OF SERVICE
// ==========================================
const TERMS_SECTIONS = [
  {
    title: '1. Acceptance of Terms & Relationship with Operator',
    body: 'Welcome to Roomie (the "Platform" or "Service"), operated by GIGSRentals ("we", "us", or "our"). By downloading, accessing, browsing, or creating an account on the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms") in their entirety, alongside our Privacy Policy. If you do not agree to these Terms, you must immediately cease all access and use of our Platform. These Terms constitute a legally binding agreement between you, as a user of the Platform, and GIGSRentals.'
  },
  {
    title: '2. The Roomie Platform Service Description',
    body: 'Roomie provides a student roommate-matching and housing referral application designed to facilitate connections between students seeking shared living accommodations, primarily within Nigeria. We act solely as a technology provider that provides (a) compatibility profiling to facilitate peer introductions and (b) curated listing database access for housing referrals. You acknowledge and agree that GIGSRentals is NOT a real estate agent, housing broker, property manager, landlord, or guarantor of any accommodation. We do not own, manage, lease, inspect, or endorse any properties listed on the platform, nor do we inspect or verify the character, background, or physical properties of the users.'
  },
  {
    title: '3. Eligibility and User Verification',
    body: 'To access and use Roomie, you must be a natural person who is at least eighteen (18) years of age. By registering, you warrant that you are at least 18 years old, possess the legal capacity to enter into binding agreements under Nigerian law, and are registering solely for educational-related student housing coordination. You agree to provide true, accurate, current, and complete details on your profile and to complete the Google OAuth registration process securely. GIGSRentals does not guarantee or perform background checks, crime checks, or financial audits on users. Roomie is restricted to human users; any account created by bots or automated tools will be deleted immediately.'
  },
  {
    title: '4. Fees, Payments, and Refund Policy',
    body: 'Access to standard search tools is free. However, Roomie charges a one-time, non-refundable platform access fee of ₦2,000 (Two Thousand Naira) to unlock access to our housing referral listings database. All transactions are securely processed through third-party payment gateways (including Paystack or Flutterwave). GIGSRentals does not store or process payment card details directly. This fee is strictly for housing database access, and payment does not guarantee that you will successfully secure housing or match with a roommate. All payments are final and completely non-refundable once listing access is unlocked on your account.'
  },
  {
    title: '5. Prohibited Conduct and System Integrity',
    body: 'Users are strictly prohibited from engaging in any behavior that degrades the safety, integrity, or functionality of the Platform. Prohibited conduct includes, but is not limited to: (a) posting false, deceptive, or misleading listing information; (b) creating duplicate profiles or impersonating other individuals or entities; (c) soliciting money, loans, bank details, or commercial transactions from other users; (d) harassing, threatening, stalking, or discriminating against other users on any grounds; (e) scraping, crawling, indexing, or reverse-engineering any portion of our database or source code; and (f) uploading files containing malware or software designed to disrupt operations. Violators are subject to immediate termination without refund.'
  },
  {
    title: '6. Safety Guidelines and Personal Responsibility',
    body: 'You acknowledge that matching with roommates and coordinate housing involves inherent personal safety risks. You are solely responsible for your own safety and interactions. You agree to follow the safety protocols recommended by Roomie: (a) always conduct initial communications within the app; (b) meet potential roommates in public, well-lit spaces; (c) inform friends or family members of your location before meetings; (d) inspect physical properties in daylight and in the company of a trusted companion; and (e) never transfer deposits or rental payments to landlords or roommates without verified written agreements and verification of physical property ownership.'
  },
  {
    title: '7. Disputes Between Users and Roommates',
    body: 'GIGSRentals is not a party to any contract, sublease, roommate agreement, or verbal commitment made between Platform users or between users and third-party housing providers. If a roommate arrangement fails, or if a landlord breaches a tenancy agreement, you acknowledge that all claims must be directed solely to the relevant counterparty. GIGSRentals will not act as a mediator, arbitrator, or witness in user-to-user or user-to-landlord disputes, and disclaims all liability for any financial or residential damages resulting from such arrangements.'
  },
  {
    title: '8. Disclaimer of Warranties',
    body: 'Roomie is provided strictly on an "as is" and "as available" basis without warranties of any kind, whether express, implied, or statutory. GIGSRentals makes no warranties regarding: (a) the compatibility, behavior, or character of any roommate matching on the Platform; (b) the availability, safety, suitability, legality, or cleanliness of any housing referral listings; (c) the continuous, uninterrupted, or secure access to the Platform; or (d) the truthfulness of user profiles. To the maximum extent permitted by law, we disclaim all warranties including merchantability and fitness for a particular purpose.'
  },
  {
    title: '9. Limitation of Liability & Indemnification',
    body: 'To the maximum extent permitted by applicable law, GIGSRentals, its parent companies, subsidiaries, directors, officers, employees, or agents shall not be liable for any direct, indirect, special, incidental, punitive, or consequential damages. This includes, without limitation, loss of profits, loss of data, property damage, personal injury, emotional distress, or financial losses arising out of or in connection with: (a) your use or inability to use the Platform; (b) your interactions, meetups, or shared living arrangements with other users; or (c) any listing or accommodation obtained through referrals. You agree to indemnify, defend, and hold GIGSRentals harmless from any claims, suits, or liabilities arising from your violation of these Terms.'
  },
  {
    title: '10. Governing Law and Arbitration',
    body: 'These Terms, and all claims or disputes arising out of or relating to them, shall be governed by, construed, and enforced in accordance with the laws of the Federal Republic of Nigeria. In the event of a dispute, controversy, or claim arising out of or relating to these Terms, the parties shall first attempt to resolve it amicably through negotiation for a minimum of thirty (30) days. Any dispute that remains unresolved shall be referred to and finally resolved by binding arbitration in Lagos State, Nigeria, in accordance with the Arbitration and Mediation Act, 2023. The arbitration proceedings shall be conducted in English by a single arbitrator appointed by agreement of both parties or, failing agreement, by the Lagos Court of Arbitration.'
  },
  {
    title: '11. Intellectual Property Rights',
    body: 'All intellectual property rights in the Platform, including but not limited to our brand names, trademarks, logo designs, graphics, user interface layouts, software code, database structures, and copywriting, are exclusively owned by GIGSRentals or our licensors. You are granted a limited, personal, non-transferable, revocable licence to access and use the Platform for your personal, non-commercial use only. Any unauthorized copy, reproduction, modification, distribution, or scraping of our platform assets is strictly prohibited.'
  },
  {
    title: '12. Account Termination',
    body: 'We reserve the right, in our sole discretion and without notice or liability, to suspend, disable, or terminate your account and block your access to the Platform if we determine that: (a) you have violated any provision of these Terms; (b) you have engaged in fraudulent, misleading, or abusive activities; (c) you pose a safety risk to other users; or (d) we are required to do so under Nigerian law. You may delete your account at any time through your Profile Settings.'
  },
  {
    title: '13. Amendments to Terms',
    body: 'GIGSRentals reserves the right to amend, update, or modify these Terms at any time. When we make material changes, we will post the revised Terms on the Platform and update the "Last updated" date. Your continued access or use of the Platform after changes take effect constitutes your binding acceptance of the updated Terms.'
  },
  {
    title: '14. Contact Information',
    body: 'If you have any questions, feedback, or legal inquiries concerning these Terms, please contact us by email at support@gigsrentals.com or write to us at: Legal & Compliance Department, GIGSRentals, Lagos, Nigeria.'
  }
];

// ==========================================
// DATA: PRIVACY POLICY
// ==========================================
const PRIVACY_SECTIONS = [
  {
    title: '1. Introduction and Data Controller',
    body: 'Roomie ("we", "us", or "our") is owned and operated by GIGSRentals. We are committed to protecting your privacy and safeguarding your personal data. This Privacy Policy details how we collect, process, share, and protect your information when you access or use the Roomie platform. Under the Nigeria Data Protection Act (NDPA) 2023, GIGSRentals is the primary Data Controller. By creating an account or using Roomie, you explicitly consent to the collection, storage, and processing of your personal data as outlined in this policy.'
  },
  {
    title: '2. Lawful Bases for Processing Data',
    body: 'In compliance with Section 25 of the Nigeria Data Protection Act (NDPA) 2023, we only process your personal data under the following lawful bases: (a) Consent: where you have given explicit consent (e.g., uploading profile photos, completing matching bios); (b) Contractual Performance: processing necessary to provide our matchmaking services and fulfill our transaction obligations (e.g. processing the ₦2,000 listing fee); (c) Legal Obligation: compliance with tax laws, fraud prevention, and law enforcement directives; and (d) Legitimate Interests: security audits, spam prevention, and improving matching algorithms.'
  },
  {
    title: '3. Information We Collect',
    subsections: [
      {
        label: 'A. Profile and Registration Information',
        text: 'Includes your full name, email address, phone number, age, gender, university, matriculation year (or enrollment status), profile photograph, roommate lifestyle preferences (sleeping schedule, cleanliness rating, smoking/drinking habits, budget range, and desired locations).'
      },
      {
        label: 'B. Authentication Data',
        text: 'We utilize secure Google OAuth via Supabase for registration and login. We receive your verified email, display name, and avatar from your Google account. We do not collect or store your Google password.'
      },
      {
        label: 'C. Financial Transactions',
        text: 'When you purchase access to housing listings, all payments are managed by Paystack or Flutterwave. We do not store credit card or bank account details. We collect and store only transaction references, timestamps, payment success status, and transaction amounts.'
      },
      {
        label: 'D. Technical and Usage Data',
        text: 'Includes IP address, browser type, device type, operating system version, page view durations, matching swipes, message logs, and broad geographic locations (city-level).'
      }
    ]
  },
  {
    title: '4. How We Use Your Personal Data',
    body: 'We process your personal information to deliver a secure and optimized roommate-matching experience, specifically to: (a) register and maintain your secure user profile; (b) compute compatibility scores and display profiles to matching candidates; (c) process transaction fees and grant database permissions; (d) send you notifications regarding connection requests or platform updates; (e) monitor, detect, and prevent fraudulent listings, scams, and policy violations; (f) conduct server diagnostic checks and optimize layout displays; and (g) fulfill mandatory tax and regulatory filings under Nigerian law.'
  },
  {
    title: '5. Information Sharing and Disclosure',
    body: 'We do not sell, rent, or trade your personal data to third-party advertisers. Your information is disclosed only in the following scenarios: (a) Platform Users: your profile name, university, budget, age, lifestyle preferences, and bio are viewable by registered Roomie users looking for roommates; (b) Service Providers: we share data with cloud infrastructure provider Supabase (database storage), Vercel (web hosting), and payment gateways (Paystack/Flutterwave) strictly to deliver platform features; (c) Group Companies: with GIGSRentals affiliates to coordinate housing services; and (d) Legal Mandate: to Nigerian law enforcement agencies or courts if requested under a valid warrant or subpoena.'
  },
  {
    title: '6. International Data Transfers',
    body: 'Your personal data is stored on cloud servers hosted by our service providers (e.g. Supabase, Vercel) which may be located in the United States or the European Union. In compliance with Section 41-43 of the Nigeria Data Protection Act (NDPA) 2023, we ensure that these cross-border transfers are protected using Standard Contractual Clauses (SCCs) and encryption standards that guarantee an equivalent level of security for your data, as mandated by the Nigeria Data Protection Commission (NDPC).'
  },
  {
    title: '7. Data Security Measures',
    body: 'We implement robust administrative, technical, and physical security measures to protect your personal data against unauthorized access, loss, or manipulation. These measures include: (a) database Row-Level Security (RLS) policies ensuring users can only read authorized records; (b) complete transit encryption via HTTPS/TLS 1.3; (c) tokenized OAuth login protocols; and (d) restricted backend access limits for staff. However, no internet-based service is completely secure; we advise against transmitting highly sensitive personal credentials (such as bank details) to other users in platform chat rooms.'
  },
  {
    title: '8. Data Retention and Deletion',
    body: 'We retain your profile data as long as your account is active and necessary for matchmaking. If you submit a request to delete your account via profile settings, we will permanently delete or anonymize your personal data within thirty (30) days from our active databases. We will retain transaction and invoice data for a period of seven (7) years to comply with Nigerian corporate tax regulations, after which it will be purged.'
  },
  {
    title: '9. Your Legal Rights under NDPA',
    body: 'Under the Nigeria Data Protection Act (NDPA) 2023 and NDPR, you possess specific, enforceable rights over your data. These include the right to: (a) request access to the personal data we hold about you; (b) request correction of inaccurate or incomplete profile records; (c) request deletion of your account and related profile details; (d) object to processing or request restrictions under certain conditions; (e) receive your data in a structured, machine-readable format (data portability); and (f) withdraw consent at any time. To exercise these rights, please email our Data Protection Officer at support@gigsrentals.com. If you believe your data has been handled unlawfully, you have the right to lodge a formal complaint with the Nigeria Data Protection Commission (NDPC).'
  },
  {
    title: '10. Cookie Audit and Consent Management',
    subsections: [
      {
        label: 'A. Necessary Cookies',
        text: 'We use first-party session cookies set by Supabase to verify your authentication state, ensure session persistence, and protect against Cross-Site Request Forged (CSRF) attacks. These are essential and cannot be opted out.'
      },
      {
        label: 'B. Analytics Cookies',
        text: 'These help us measure website traffic, visitor demographics, and user behavior. We load these analytics scripts (e.g. Google Analytics) only after you grant consent via our Cookie Banner.'
      },
      {
        label: 'C. Preference & Functional Cookies',
        text: 'Used to store your app customizations, such as sidebar state, layout choices, and onboarding step records.'
      }
    ]
  },
  {
    title: '11. Data Protection Officer (DPO)',
    body: 'We have designated a Data Protection Officer to oversee our privacy framework. If you have questions, complaints, or wish to exercise your rights, please address your inquiries to: Data Protection Officer, GIGSRentals Legal Dept, Lagos, Nigeria, or email support@gigsrentals.com.'
  },
  {
    title: '12. Updates to This Policy',
    body: 'We may modify this Privacy Policy from time to time to reflect changes in regulatory standards or Platform updates. We will notify you of any material updates via an in-app banner, email, or a prominent notice on the home page prior to the modifications taking effect. The "Last updated" date at the top of the policy page will indicate when changes were last implemented.'
  }
];

// Execute builds
buildPDF('terms.pdf', 'Terms of Service', TERMS_SECTIONS, 'July 1, 2026');
buildPDF('privacy.pdf', 'Privacy Policy', PRIVACY_SECTIONS, 'July 1, 2026');
