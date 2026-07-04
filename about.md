# About Roomie

> **Tagline:** Connect and Cooonnectttt  
> **Essence:** The student-first roommate discovery, matching, and billing platform.  
> **Attribution:** Roomie is a [GIGSRentals](https://gigsrentals.com) product.

---

## 1. The Essence of the App

**Roomie** is a dedicated student-first SaaS Progressive Web Application (PWA) designed to revolutionize how university students in Nigeria find compatible roommates and transition into shared living arrangements. 

The core essence of Roomie can be summarized in a simple analogy: **Facebook Marketplace meets Tinder-like compatibility matching for student roommates, combined with a direct, automated handoff to physical housing providers.**

Unlike generic listing platforms or swipe-heavy dating-style clones, Roomie is built from the ground up around **intentionality, safety, and community**. The student journey doesn't end when a roommate is found; Roomie guides the matched pair through:
1. Identifying shared lifestyles and budget compatibility.
2. Building trust via secure real-time messaging.
3. Formally committing to cohabitation through an in-chat **Roommate Agreement**.
4. Accessing curated, campus-specific student hostels and accommodation options.
5. Managing shared living expenses using a built-in **Bill Splitter**.

---

## 2. The Rationale Behind the App (The "Why")

Finding a roommate as a Nigerian university student is a stressful, fragmented, and often risky experience. The platform addresses several critical pain points:

### The WhatsApp/Telegram Spam Problem
Currently, students rely on chaotic campus WhatsApp groups, Telegram channels, or Twitter broadcasts to search for roommates. These posts get buried in minutes under hundreds of other messages. Roomie solves this with:
* The **Social Feed (`/feed`)**: A structured bulletin board where roommate requests are centralized, searchable, and persistently accessible.
* The **Discover Feed (`/discover`)**: A card-based directory that filters roommate seekers by university, budget, city, and lifestyle.

### Lifestyle Clashes and Mismatches
Students often move in with strangers only to discover toxic incompatibilities regarding sleeping patterns, cleanliness standards, guest policies, noise tolerances, or smoking/pets. 
* **The Solution:** Roomie’s **Compatibility Engine** computes an upfront matching score (0-100%) between profiles based on explicit lifestyle factors, removing the guesswork before any contact is initiated.

### Financial Disputes and Ledger Ambiguity
Cohabitating students frequently clash over utility split calculations (electricity, water, cooking gas) or rent schedules.
* **The Solution:** An in-app, peer-to-peer **Bill Splitter (`/splits`)** that acts as a shared ledger, allowing roommates to register expenses, specify custom or equal splits, attach payment receipts, and record settlement status transparently.

### Safety, Trust, and Rental Scams
The student housing market in Nigeria is prone to rental agents scamming students with fake house listings or non-existent hostels.
* **The Solution:** Roomie implements a **Student Identity Verification System** where students upload their institutional IDs. Once verified by admins, they receive a "Verified Student" badge. Furthermore, Roomie redirects matched roommates only to approved and vetted **Housing Platform Providers**, shielding them from predatory agents.

### The Disconnect Between Matching and Housing
Most roommate-finding tools stop at the chat. However, roommates are only looking for each other because they *need a place to live*. 
* **The Solution:** Roomie bridges this gap. When roommates commit via the agreement, the platform immediately redirects them to verified local housing options, closing the loop on the student housing search.

---

## 3. Comprehensive Feature Walkthrough

Roomie comprises three applications running inside a Turborepo monorepo workspace (see [implementationRoomie.md](file:///c:/Users/admin/Desktop/Roomie/implementationRoomie.md)):
1. **`apps/web`**: A marketing landing SPA designed to explain the platform, convert visitors to users, and register housing providers.
2. **`apps/app`**: The main student-facing Progressive Web App (PWA).
3. **`apps/admin`**: The platform control panel used by Super Admins (moderators) and Housing Providers.

### A. Progressive & Resumable Onboarding Flow
Onboarding is built with a step-saving architecture. Every time a student completes a step, the data writes instantly to Supabase, protecting against mobile network drop-offs. If a user closes the app, they resume exactly where they left off.

* **Step 0: Welcome Screen:** Animated introduction screen utilizing Lottie animations.
* **Step 1: Basics:** Capture display name, birthdate (calculates numeric age), gender (restricted to Male / Female to match local university hostel regulations), and target city.
* **Step 2: University Details:** Select from a pre-loaded list of Nigerian universities, study year, and course/faculty.
* **Step 3: Vibe & Lifestyle:** Tap-to-select interface for sleep schedules (Early Bird, Night Owl, Flexible), cleanliness slider, noise tolerance, roommate guidelines (smoking, pets, guests), and lifestyle tags (e.g., `studious`, `social`, `religious`, `gamer`, `homebody`).
* **Step 4: Budget & Timeline:** Dual-handle slider to select a monthly budget range (from ₦20,000 to ₦500,000+), move-in date, and preferred roommate gender.
* **Step 5: Identity Upload:** Optional step to upload student ID cards (front & back) to request a verified checkmark.

### B. The Social Feed (`/feed`)
A dynamic feed that operates similarly to Twitter/X.
* **Posting:** Students broadcast custom roommate requests, specifying target campuses, budget parameters, and move-in constraints.
* **Reactions & Comments:** Supports multi-reaction options (`love`, `laughter`, `confusion`, `applause`, `anger`) mapped directly to Postgres JSONB triggers (see [0023_feed_reactions_and_threads.sql](file:///c:/Users/admin/Desktop/Roomie/supabase/migrations/0023_feed_reactions_and_threads.sql)).
* **Navigation:** Clickable profiles lead directly to the Discover card or Detail page.
* **Shortcuts:** Includes a floating composer button (FAB) that auto-focuses the input on click, and a notification bell shortcut in the mobile header.

### C. The Discover Feed (`/discover`)
A layout showing profile cards of students searching for roommates.
* **Inline Connection:** A "Connect" button directly triggers a connection request (see [connections.ts](file:///c:/Users/admin/Desktop/Roomie/packages/db/src/queries/connections.ts)).
* **Filters:** Users can filter the grid by city, university, budget overlap, verification status, and lifestyle tags.

### D. Compatibility Engine
A client-side weighted heuristic (implemented in `packages/db/src/lib/compatibility.ts` — described in [profiles.ts](file:///c:/Users/admin/Desktop/Roomie/packages/db/src/queries/profiles.ts)) calculates a compatibility score:
* **Budget Overlap (30%):** Proportional overlap of the two users' min-max budget ranges.
* **Sleep Schedule (20%):** Exact matches yield full score, flexible matchups yield partial score.
* **Cleanliness (15%) & Noise Pref (15%):** Proximity-based scoring (sliding scale depending on levels).
* **Location (10%):** Exact match of target city.
* **Lifestyle Tags (10%):** Size of overlapping tags relative to total tags selected.

### E. Real-Time Chat & Messaging (`/chat`)
A direct messaging interface powered by Supabase Realtime (see [messages.ts](file:///c:/Users/admin/Desktop/Roomie/packages/db/src/queries/messages.ts)).
* **Features:** Instant message updates, read receipts, image sharing via Supabase Storage, and ephemeral typing indicators via Supabase Presence (without database write overhead).
* **System Messages:** Dynamic notifications injected into the thread (e.g., when roommate agreements are proposed, or bill splits are updated).

### F. Roommate Agreement & Consent Flow
The core monetization point of Roomie.
1. Within an active chat, one user proposes a **Roommate Agreement** (via the chat UI or `/agree`).
2. An interactive request card appears in the recipient's chat.
3. The acceptor confirms the agreement and pays a one-time fee of **₦2,000** via the Paystack inline popup (see [PaystackButton.tsx](file:///c:/Users/admin/Desktop/Roomie/apps/app/src/components/connect/PaystackButton.tsx)).
4. Paystack webhooks (verifying HMAC-SHA512 headers) update the agreement table status to `CONFIRMED` (see [0003_roommate_agreements.sql](file:///c:/Users/admin/Desktop/Roomie/supabase/migrations/0003_roommate_agreements.sql)).
5. This unlocks the "Roomie Partners" badge and activates access to the housing directories.

### G. Shared Bill Splitting Ledger (`/splits`)
Allows matched roommates to coordinate expenses:
* **Creating splits:** Input bill titles, select total amounts, and upload payment receipts.
* **Distribution:** Splitting can be set to equal distribution or customized per roommate.
* **Settlement:** Roommates mark their portions as paid. Settled bills are archived, and actions generate instant system alerts in their chat logs.

### H. Curated Housing Platform Referrals (`/housing`)
Once the roommate agreement is paid, both partners unlock the curated list of vetted local student housing providers.
* **Geo-Targeting:** The list displays providers serving the user's specific city or campus.
* **Redirect Tracking:** Clicking a housing card logs the click event in the analytics tables (`platform_clicks`) before redirecting the user to the provider's website.

### I. Student Identity Verification System
Protects the platform's integrity:
* ID card images are uploaded to a **private Supabase Storage bucket** (`student-ids`), accessible only via signed server URLs.
* Super Admins verify submissions in the admin console. Once approved, the user gets the animated Lottie Verified Checkmark on their cards.

### J. PWA & Offline Support
Roomie is optimized for Nigerian mobile network conditions (which can be unstable):
* **PWA Service Worker:** Caches CSS/JS assets and profile details.
* **Offline Routing:** Displays cached discovery profiles and messaging logs during disconnections, queuing outgoing messages/actions.

---

## 4. Technical Architecture Decisions & Rationale

| Technology | Role | Rationale |
| :--- | :--- | :--- |
| **Next.js 16 (App Router)** | Web Applications | Facilitates server-side rendering (SSR), optimized layout caching, API routes, and handles static exports for the marketing site (`apps/web`). |
| **Supabase (PostgreSQL)** | Backend & Database | Chosen over Firestore/Firebase due to the relational nature of connections, agreements, and payments. Supabase provides native SQL `JOIN` support, robust Row-Level Security (RLS) policies, Realtime hooks, and storage bucket APIs. |
| **Turborepo** | Monorepo Orchestration | Manages shared configurations (Tailwind, ESLint, TypeScript) and shared code packages (`packages/ui` for UI components, `packages/db` for database queries) with efficient caching. |
| **Paystack Integration** | Payment Processing | The dominant payment processor in Nigeria. Supports local channels (OPay, PalmPay, Bank Transfer, USSD, Cards) through a pop-up SDK, with secure backend webhook signature verification. |
| **Lottie & Framer Motion** | Animations & Icons | Leveraged for premium, fluid visual cues (e.g., matching animations, payment confirmation, verified tags). Emojis are excluded to maintain a professional, cohesive app aesthetic. |
| **Serwist** | PWA Management | Extends Next.js with solid Service Worker registration, routing, caching strategies, and background sync capability. |

---

## 5. Business Model & Unit Economics

Roomie is monetized through a transactional commitment model:
* **Free Tier:** Discovering roommates, customizing profiles, matching, and basic chatting are completely free. This ensures low barrier-to-entry and rapid user acquisition.
* **One-Time Agreement Fee:** Accessing the curated housing provider catalog is locked behind the Roommate Agreement. The agreement is initiated within the chat; the acceptor pays **₦2,000** (processed via Paystack). This one-time payment unlocks housing services for *both* users in that connection.
* **Attribution:** As a product owned by **GIGSRentals**, Roomie contains the parent platform attribution in the footer of all pages across all three monorepo apps:
  `© 2026 Roomie · A GIGSRentals Product` (linking to `https://gigsrentals.com`).

---

## 6. Project Structure Overview

```
Roomie/
├── apps/
│   ├── web/                    # Marketing SPA (Next.js, static export)
│   ├── app/                    # Main PWA (Next.js 16, App Router)
│   └── admin/                  # Provider & Admin dashboard (Next.js)
├── packages/
│   ├── ui/                     # Shared Design System & Component Library
│   ├── db/                     # Supabase schema definitions, types, & query helpers
│   ├── config/                 # Monorepo configs (Tailwind, TypeScript, ESLint)
│   └── animations/             # Lottie JSON assets
├── supabase/
│   ├── migrations/             # Version-controlled SQL migration scripts
│   └── seed.sql                # Seed database dump for local development
└── about.md                    # Project overview (this document)
```
