# About Roomie

> **Tagline:** Just Connect  
> **Essence:** The student-first roommate discovery, matching, and billing platform.  
> **Attribution:** Roomie is a [GIGSRentals](https://gigsrentals.com) product.

---

## 1. What is Roomie? (The Platform Vision)

**Roomie** is the unified identity, trust, and billing ecosystem for student housing in Nigeria. 

The platform’s vision extends far beyond a simple roommate matching service. It is designed to be the foundational **Identity and Payment Infrastructure** for the student co-living market, connecting student roommates, student hostels, and property owners in a secure, transparent, and automated network.

Instead of leaving students stranded once they match, Roomie guides roommate pairs or larger groups (known as **Roomie Pools**) through the entire renting lifecycle under a fully consent-based model:
1. **Discovering Compatibility:** Finding roommates or forming group pools matching lifestyle, budget, and school details.
2. **Forming a Partnership:** Establishing mutual trust and co-signing a formal, in-app **Roommate Agreement** (requiring explicit, consent-based sign-off from all members of the group).
3. **Securing Vetted Accommodation:** Accessing local, verified student hostel options to avoid rental scammers.
4. **Dividing Costs:** Coordinating expenses transparently through a shared ledger.
5. **Managing Exit Procedures:** Signing off on joint move-outs to ensure caution deposits are split and returned safely, backed by unanimous consent from all roommates in the pool.

---

## 2. The Problem We Solve (Why Roomie Exists)

Finding student housing in Nigeria is a fragmented, stressful, and highly risky experience. Roomie solves these challenges directly:

* **Chaotic Search Forums:** Currently, students rely on disorganized campus social media groups to find roommates. Posts get buried in minutes. Roomie centralizes searches with a searchable **Social Feed** and filtered **Discover Directory**.
* **Lifestyle Clashes:** Strangers move in together only to clash over sleeping habits, cleanliness standards, or guest rules. Roomie’s compatibility matchmaking computes lifestyle overlaps upfront, removing the guesswork.
* **Financial Disputes:** Shared expense tracking is often chaotic and causes roommate friction. Roomie’s built-in bill splitter calculates and coordinates rent and utility payments transparently.
* **Predatory Rental Scams:** Fake housing agents frequently scam students out of money with non-existent hostels. Roomie combats this by requiring student identity cards to verify student status, and by only recommending vetted local accommodation providers.
* **The Match-to-Housing Disconnect:** Traditional roommate finder tools end at matching. Because roommates connect specifically because they *need a place to live*, Roomie directly channels verified student pairs straight into approved local housing options.

---

## 3. Product Features & User Journey

The Roomie application ecosystem guides students step-by-step through their co-living experience:

### A. Dynamic Profile Setup
Students configure their profiles with academic information, year of study, target budget ranges, move-in timelines, and specific lifestyle sliders (cleanliness, noise tolerance, sleep schedules, and smoking/pets rules).

### B. Social Feed
A structured bulletin board where students broadcast custom roommate requests, comment on posts, react to social threads, and view profiles.

### C. Discover Directory
A directory listing student profiles searching for roommates, filterable by target city, university, budget overlap, verification status, and lifestyle tags.

### D. Compatibility Engine
A matching scoring system that evaluates profile factors (such as budget overlap, sleep schedule match, cleanliness compatibility, location overlap, and shared lifestyle preferences) to suggest ideal roommate pairs.

### E. Secure Messaging
A chat workspace where matched students converse, share media, and receive system updates (such as proposed roommate agreements or shared ledger changes).

### F. Roommate Agreements & Roomie Pools
Within private chat threads or group chats, roommates officially commit to their partnership. While standard matches connect two students, Roomie supports **Roomie Pools** for groups of three or more roommates. Every agreement, invite, and action within a pool operates on a **fully consent-based model**—group commitments do not activate until every single member has co-signed the agreement and paid their individual processing contribution.

### G. Expense Splitter
A shared ledger where roommate partners or entire Roomie Pools divide rent, security deposits, or utilities (either equally or through custom ratios), upload receipts, and register when payments are settled. In a Roomie Pool, new split configurations or changes to bill balances require explicit, trackable consent from all affected roommates before they are finalized.

### H. Vetted Hostel Catalog
A geo-targeted catalog of housing providers serving the student's campus, displaying active hostel listings and redirecting verified pairs directly to booking pages.

### I. Student Identity Checks
Students upload their institutional ID cards for administrative review. Verified profiles receive a verified badge, boosting trust.

### J. Network Stability Cache
Designed for unstable mobile network conditions, Roomie caches profile details and messaging logs to allow search, communication, and action queuing even during offline disconnections.

---

## 4. The Future of Prop Identity & Roomie Auth

The long-term value of Roomie is standardizing student tenant credibility and payment flow for the real estate industry:

### A. The Era of Roomie Auth (OAuth SSO)
Roomie is establishing a single-sign-on protocol. 
* External hostel websites can integrate a **"Connect with Roomie ID"** option.
* Students authenticate using their Roomie account, allowing external platforms to verify their identities and check for active co-roommate connections or Roomie Pools immediately.

### B. Prop Identity & The Unified Renter Passport
We are creating a portable credential document for student renters.
* **The Passport:** External housing sites pull the student's **Renter Passport** (verified student badge, co-tenant partners in their Roomie Pool, age, university records, and financial settlement history), bypassing redundant application questionnaires.
* **The Safety Network:** Roomie maps connection histories (who has lived with whom). Housing platforms check these networks to view mutual student connections, reducing application fraud and confirming co-living records.
* **Escrow & Joint Checkout:** To secure caution deposits, landlords, individual roommates, and entire Roomie Pools utilize a digital checkout consent workflow. Refunding deposits requires explicit, digital checkout sign-off and checklist approval from every roommate in the pool, triggering automated payouts to each roommate in their exact split ratio, preventing any unilateral deposit release.

### C. The Developer Hub
The developer site serves integration documentation and testing sandboxes where external housing developers verify SSO configurations, test split payment webhooks, and simulate checkout consensus.

---

## 5. Business Model & Unit Economics

Roomie is monetized through a transactional commitment model:
* **Free Matching Tools:** Discovering roommates, configuring profiles, and general chat messaging are entirely free to encourage user growth.
* **Agreement Fee:** Accessing the vetted housing directories is locked behind the Roommate Agreement. The accepting roommate pays a one-time fee of **₦2,000** to confirm the partnership, which unlocks the housing catalog for both users.
* **Attribution:** As a GIGSRentals product, parent platform attribution is included across all client screens.

---

## 6. System Ecosystem Architecture

The Roomie codebase is structured to run the entire student-to-provider journey:
* **Student Web Portal:** Public marketing pages introducing the service and registering housing providers.
* **Student Web App:** The primary student-facing application supporting profiles, matching, chat, splits, and hostel directories.
* **Administrator Portal:** The control dashboard where platform admins moderate content, review student IDs, and approve hostel listings.
* **Backend API & OAuth Server:** The centralized service layer running calculations, managing database connections, processing transactions, and hosting the SSO protocol.
* **Developer Integration Portal:** The documentation hub and interactive testing platform for housing partners.

For detailed technical designs and code layouts, refer to [implementationRoomie.md](file:///c:/Users/admin/Desktop/Roomie/implementationRoomie.md), [dependence.md](file:///c:/Users/admin/Desktop/Roomie/dependence.md), and [BackendMigration.md](file:///c:/Users/admin/Desktop/Roomie/BackendMigration.md).
