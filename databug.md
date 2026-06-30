# Database & Data Performance Analysis (`databug.md`)

This document outlines the investigation into why data fetching, tab switching, messaging, and filtering are slow in the Roomie application under **Supabase**, how these issues are resolved locally, and what actions are required for production.

---

## 💡 Are the seeded profiles causing the lag?

**No, the seeded profiles are not causing the lag.**
An analysis of [supabase/seed.sql](file:///c:/Users/admin/Desktop/Roomie/supabase/seed.sql#L37-L101) shows that there are only **25 profiles** and **3 connections** seeded for testing. 
*   In database terms, 25 rows is a microscopic dataset.
*   Even with completely unindexed tables, PostgreSQL can scan 25 rows in **less than 0.1 milliseconds**. 
*   Therefore, the lag is not caused by the volume of seeded data, but rather by **network roundtrips, duplicate request waterfalls, unoptimized client-side updates, and missing query indexes**.

---

## 1. Remote Network Roundtrips (Local Dev calling Cloud API)
> **Status:** ✅ **RESOLVED (Local Dev)**

### The Issue
Initially, the frontend was configured to hit the remote Supabase Cloud project directly from local machines:
```env
NEXT_PUBLIC_SUPABASE_URL=https://yjvjhqwuufecykvolmnq.supabase.co
```
This caused 150ms–400ms physical distance latencies and 5–15 second database pauses (cold starts) on the free tier.

### The Fix
Redirected all frontend applications (`app`, `admin`, `web`) to the local Docker-based Supabase stack running on `http://127.0.0.1:54321`. This reduces local development query response times to **< 5ms**.

---

## 2. Suboptimal Database Schema & Missing Indexes (Full Table Scans)
> **Status:** ✅ **COMPLETED (Applied via Migration 0013_performance_indexes.sql)**

Even though the database is small now, as it grows, the lack of indexes on core tables will degrade performance. Adding indexes directly to your Supabase PostgreSQL database will resolve full table scans.

### A. Missing indexes on `connections` foreign keys
*   **The Problem:** When fetching a user's connections (which happens on every tab mount via [useConnections.ts](file:///c:/Users/admin/Desktop/Roomie/apps/app/src/hooks/useConnections.ts#L25-L28)), the database queries `requester_id = USER_ID OR receiver_id = USER_ID`. Since there are no B-tree indexes on `requester_id` or `receiver_id` individually, PostgreSQL is forced to perform a **full table scan** on the entire `connections` table.
*   **The Rectification:** Run a migration (or execute SQL in the Supabase Dashboard SQL Editor) to add standard B-tree indexes:
    ```sql
    CREATE INDEX idx_connections_requester ON public.connections(requester_id);
    CREATE INDEX idx_connections_receiver ON public.connections(receiver_id);
    ```

### B. Missing indexes on `profiles` sorting columns
*   **The Problem:** The roommates feed queries `is_active = true AND onboarding_complete = true ORDER BY last_seen_at DESC`. There is no index on `profiles(last_seen_at)`. Every feed view triggers an in-memory/disk **Filesort**.
*   **The Rectification:** Create a composite index to speed up the default feed:
    ```sql
    CREATE INDEX idx_profiles_feed ON public.profiles(is_active, onboarding_complete, last_seen_at DESC);
    ```

### C. Missing GIN index on Array columns (`lifestyle_tags`)
*   **The Problem:** Roommate filtering utilizes `.overlaps("lifestyle_tags", tags)`. Since `lifestyle_tags` is a `TEXT[]` array column with no index, PostgreSQL must evaluate every profile sequentially.
*   **The Rectification:** Add a GIN (Generalized Inverted Index) on `lifestyle_tags`:
    ```sql
    CREATE INDEX idx_profiles_lifestyle_tags ON public.profiles USING gin(lifestyle_tags);
    ```

### D. Missing reverse index on `blocks`
*   **The Problem:** Excluding blocked users checks `blocker_id` and `blocked_id`. While there is an index for `(blocker_id, blocked_id)`, queries checking only for `blocked_id` cannot use it.
*   **The Rectification:** Add an index on `blocked_id`:
    ```sql
    CREATE INDEX idx_blocks_blocked_id ON public.blocks(blocked_id);
    ```

---

## 3. Lack of Client-Side Caching (Duplicate Request Cascades)
> **Status:** ✅ **COMPLETED (Implemented SWR caching in useConnections and useProfile)**

### The Issue
The frontend uses standard React `useState` + `useEffect` to fetch data. 
*   When a user switches tabs (e.g. from *Discover* to *Feed* and back), Next.js unmounts the page components. Switching back triggers the `useEffect` hooks all over again.
*   This creates a cascade of duplicate network requests to Supabase on every navigation, displaying spinners repeatedly.

### The Rectification
Implement a caching state-management library on the frontend, such as **SWR** (Stale-While-Revalidate) or **React Query** (TanStack Query). Wrap queries like this:
```typescript
const { data: connections, isLoading } = useSWR('connections', () => fetchConnections());
```
This ensures that data is served instantly from cache when switching tabs, while fetching updates silently in the background.

---

## 4. Chat Performance Bottlenecks & Roundtrips
> **Status:** ✅ **COMPLETED (Added memory caching for sender profiles in useMessages & throttled last_seen_at updates in useProfile)**

### A. Waterfall query on message receipt
*   **The Problem:** When a new message is received via Supabase Realtime, the payload does not contain the sender's details. The client immediately fires a lookup query: `.from("profiles").select("id, display_name, avatar_url")`. This delays rendering of incoming messages.
*   **The Rectification:** Store basic sender info directly on the message table if scale allows, or fetch and cache profiles client-side so you don't call the DB for the same sender profile multiple times.

### B. Chat update write on mount
*   **The Problem:** Every time the `useProfile` hook mounts (which happens on almost every page layout), it performs an update call to the database: `db.from("profiles").update({ last_seen_at: ... })`. Running a database write on every tab mount causes notable navigation lag.
*   **The Rectification:** Debounce/throttle the `last_seen_at` updates. Only fire this update if the user has been active for more than 5 minutes since the last recorded update, rather than on every hook instantiation.

---

## 5. Functional Bug in Feed Filter Representation
> **Status:** ✅ **COMPLETED (Pushed filters down to database queries and rebuilt DiscoverPage dynamic trigger)**

### The Problem
In [DiscoverPage](file:///c:/Users/admin/Desktop/Roomie/apps/app/app/discover/page.tsx#L50-L64), the feed fetches the first 20 profiles from the database and filters them **client-side** in a React `useMemo` filter. If none of the 20 loaded profiles match the filters, it displays "No profiles match", even if there are hundreds of matching profiles on other pages in the DB.

### The Rectification
Push the filter parameters down to the database query in the `useEffect` call:
```typescript
getDiscoveryFeed(supabase, user.id, filters, 0)
```
And trigger a reload of the feed whenever `filters` changes.

---

## 6. Production Latency & Scaling
> **Status:** ⏳ **PENDING (Needs Production Deployment Configuration)**

While running locally in Docker solves development latency, the following steps are required to ensure the app is fast in the live production environment.

### A. Upgrade to Supabase Pro Tier (Prevents sleeping)
*   **The Action:** Upgrade your production Supabase project to the **Pro Tier** ($25/mo). This guarantees that the database container is dedicated, always active, and never enters a sleep state (preventing the 5-15s cold starts that free projects encounter).

### B. Enable Supabase Connection Pooling (Transaction Mode)
*   **The Action:** Since Next.js uses serverless execution environments, concurrent user spikes can exhaust PostgreSQL connection limits. Connect to your database using the **Supabase Pooler connection string** (port `6543`) instead of the direct database port (port `5432`).

### C. Colocate Frontend Hosting & Database Region
*   **The Action:** Choose a database region geographically closest to your users (e.g. Cape Town `af-south-1` or London `eu-west-2` since your domain is `.ng` / Nigeria). Ensure that your Next.js frontend is deployed in a matching geographic region on your hosting provider (like Vercel) to minimize cross-region roundtrip latencies.

---

## 7. Workflow Tip: Applying Database Schema Changes Without Wiping Data
> **Status:** ✅ **DOCUMENTED**

### The Issue
Running `npx supabase db reset` completely wipes your local database, deleting any accounts, profile updates, and messages you created during testing to rebuild the database from scratch.

### The Solution (Keep your data)
To apply newly created migration files in your `supabase/migrations/` directory without losing any of your existing test data, use:
```bash
npx supabase db push
```
This command compares applied migrations in your database with local migration files, only executes the *new* migrations, and leaves all existing tables and data completely intact.

