# Roomie App Security & Hardening Guide

This document identifies potential security vulnerabilities, threat vectors, and architectural flaws in the Roomie codebase (covering both server/API architecture and database configurations), and outlines strict hardening guidelines to mitigate these risks. 

Given the active public challenge to break the application, this guide is split into two parts:
1. **Critical Exploits & Vulnerabilities Discovered in Roomie's Current Codebase**
2. **Standard Application Hardening (XSS, SSH, Packet Hijacking, DDoS, Rate Limiting, Bots, Spam, SQLi, and Jacking)**

---

## Part 1: Critical Exploits Discovered in Roomie's Schema

These vulnerabilities are present in the current Supabase SQL migrations and database configurations and would allow any attacker with basic developer console skills to compromise the app.

### 1. Super Admin Privilege Escalation (Super Admin Jacking)
* **Threat**: In `0001_initial_schema.sql`, the `admin_users` table is created:
  ```sql
  CREATE TABLE public.admin_users (
    id              UUID PRIMARY KEY REFERENCES auth.users(id),
    role            TEXT DEFAULT 'super_admin',
    created_at      TIMESTAMPTZ DEFAULT NOW()
  );
  ```
  However, **Row-Level Security (RLS) is never enabled on this table**.
* **Impact**: Supabase exposes public schema tables to the PostgREST API by default. Because RLS is not enabled, any authenticated user can make a direct API call to insert their own `auth.uid()` into `admin_users`. Once in `admin_users`, the attacker automatically satisfies the security policies of other tables (e.g., `profiles`, `user_reports`, `user_appeals`, `waitlist`, `pwa_installs`, and `housing_listings`) that grant full access to super admins:
  ```sql
  CREATE POLICY "profiles_super_admin_all" ON public.profiles FOR ALL
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
  ```
  This yields full read/write compromise of student profiles, admin views, and global configurations.
* **Remediation**: Enable RLS on `admin_users` and restrict writes strictly to the database service role (bypassing RLS for admin provisioning in backend migrations or seed scripts):
  ```sql
  ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
  
  -- Only allow reading admin_users check for authenticated users (or restrict entirely)
  CREATE POLICY "admin_users_read_policy" ON public.admin_users
    FOR SELECT USING (auth.uid() = id);
  ```

### 2. Paystack Fee Bypass (Financial Loss)
* **Threat**: In `0003_roommate_agreements.sql`, roommate agreements are protected by:
  ```sql
  CREATE POLICY "agreements_connection_members" ON public.roommate_agreements
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.connections c
        WHERE c.id = roommate_agreements.connection_id
          AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
      )
    );
  ```
* **Impact**: The policy is declared `FOR ALL`. This means any student who is a member of the underlying connection can execute **INSERT, UPDATE, and DELETE** queries directly from their browser using the Supabase client. An attacker can bypass the Paystack ₦2,000 payment screen entirely by issuing a client-side update:
  ```javascript
  await supabase
    .from('roommate_agreements')
    .update({ status: 'CONFIRMED', payment_reference: 'fake_ref_bypass' })
    .eq('connection_id', connectionId);
  ```
  This immediately unlocks access to the housing directories without paying.
* **Remediation**: Restrict the client-side policy to `SELECT` and `INSERT` (for proposing agreements) only. Disallow client-side `UPDATE` of the status field to `CONFIRMED`. Unlocking must occur strictly via the database service role (`createServiceClient`) triggered by the Paystack verification endpoint or secure webhooks:
  ```sql
  -- Remove the catch-all policy
  DROP POLICY IF EXISTS "agreements_connection_members" ON public.roommate_agreements;

  -- Create granular policies
  CREATE POLICY "agreements_select_members" ON public.roommate_agreements
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.connections c
        WHERE c.id = roommate_agreements.connection_id
          AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
      )
    );

  CREATE POLICY "agreements_insert_members" ON public.roommate_agreements
    FOR INSERT WITH CHECK (
      auth.uid() = initiator_id AND
      EXISTS (
        SELECT 1 FROM public.connections c
        WHERE c.id = connection_id
          AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
      )
    );
    
  -- Notice: No UPDATE policy is defined, forcing all status transitions to happen 
  -- via Next.js API routes bypassing RLS using the Service Role Key.
  ```

### 3. Exposed Housing Platforms and Referral Manipulations
* **Threat**: Neither `housing_platforms` nor `platform_clicks` tables have RLS enabled (omitted from `0001_initial_schema.sql` RLS section).
* **Impact**:
  - Attackers can query the `housing_platforms` table to retrieve contact names, phone numbers, and emails of hosting providers (data breach).
  - Anyone can edit provider details, set platform status to `ACTIVE`, change featured flags, or modify the `contact_email` to their own email—granting them full ownership of that provider's listings via `listings_platform_owner` policy.
  - Attackers can script bulk insertions or deletions on `platform_clicks` to inflate or destroy provider referral statistics.
* **Remediation**:
  ```sql
  ALTER TABLE public.housing_platforms ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.platform_clicks ENABLE ROW LEVEL SECURITY;

  -- Anyone can read active housing platforms
  CREATE POLICY "platforms_read_active" ON public.housing_platforms
    FOR SELECT USING (status = 'ACTIVE');

  -- platform clicks: insert only for authenticated users, select/delete restricted
  CREATE POLICY "clicks_insert_own" ON public.platform_clicks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  ```

### 4. Automated User Suspension/Barring Exploit (Denial of Service)
* **Threat**: In `0027_user_reports_and_appeals.sql`, the system suspends a profile if they get reported:
  ```sql
  IF (
    SELECT count(*) 
    FROM public.user_reports 
    WHERE reported_id = NEW.reported_id
  ) > 3 THEN
    UPDATE public.profiles
    SET is_active = false, is_barred = true, verification_status = 'REJECTED'
    WHERE id = NEW.reported_id;
  END IF;
  ```
* **Impact**: An attacker can easily spin up 4 dummy accounts programmatically using disposable emails, pass Step 0 of onboarding, and submit 4 reports against a target student's profile. This instantly suspends the victim's account without any human intervention or rate limit validation.
* **Remediation**: 
  - Remove the automated barring trigger entirely, or modify it to create an admin alert/moderation queue entry instead of triggering an immediate block.
  - Require the reporting account to have a `verification_status = 'VERIFIED'` checkmark, or rate-limit the reports table (e.g. max 1 report submitted per hour per IP/user).

---

## Part 2: Standard Application Hardening

### 1. Cross-Site Scripting (XSS)
Next.js escapes raw variables by default in TSX rendering. However, key vectors remain:
* **Storage Uploads (SVG & HTML payloads)**: Supabase Storage allows users to upload verification IDs and payment proofs. If an attacker uploads a malicious SVG containing `<script>alert(1)</script>` or an HTML file, and the file is served inline with `Content-Type: image/svg+xml` or `text/html`, visiting the link will execute the script in the context of the Supabase domain. If the main website and Supabase share cookie contexts, this leads to token/cookie theft.
* **Mitigation**:
  - Restrict allowed MIME types in Supabase storage bucket settings (allow only `image/jpeg`, `image/png`, and `application/pdf`). Explicitly block `.svg`, `.html`, and executable formats.
  - Force downloads for uploaded documents by setting headers: `Content-Disposition: attachment`.
  - Implement a strong **Content Security Policy (CSP)** header in Next.js middleware:
    ```http
    Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' https://api.paystack.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co https://api.paystack.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co; frame-ancestors 'none';
    ```

### 2. SSH & Server Infrastructure Hardening
*(Applicable if hosting any custom API proxies, background queues, or self-hosting Next.js/Supabase on VPS VMs)*
* **Threat**: Brute-force SSH attacks, open developer ports, and configuration file scanning.
* **Mitigation**:
  - **Disable Password Authentication**: Restrict SSH connections strictly to SSH key pairs.
    ```bash
    # In /etc/ssh/sshd_config
    PasswordAuthentication no
    PubkeyAuthentication yes
    ChallengeResponseAuthentication no
    ```
  - **Change the Default SSH Port**: Move the SSH daemon from port 22 to a random high-numbered port (e.g., 2222).
  - **Install fail2ban**: Automatically ban IP addresses displaying multiple failed authentication attempts.
  - **Firewall Isolation**: Configure system firewalls (e.g., UFW/Security Groups) to close all ports except `80` (HTTP), `443` (HTTPS), and the custom SSH port. Specifically, block external access to Postgres (port 5432) or Redis ports.

### 3. Packet Hijacking / Man-in-the-Middle (MitM)
* **Threat**: Eavesdropping on student chats or database queries over shared public Wi-Fi networks in university campus environments.
* **Mitigation**:
  - **Enforce TLS 1.3**: Configure servers (Vercel, Cloudflare, Supabase) to reject connections using TLS 1.0, 1.1, and weak cipher suites.
  - **Enforce HTTP Strict Transport Security (HSTS)**:
    ```http
    Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
    ```
  - **WebSocket Security**: Verify that all Supabase Realtime connections are strictly initialized via secure WebSockets (`wss://`). Ensure WebSocket messages contain verification JWTs inside the connection payload rather than exposing keys in URL parameters.

### 4. DDoS & Rate Limiting
* **Threat**: Attackers spamming Next.js API endpoints, overloading database pools, or draining Paystack balances by initializing thousands of transaction links.
* **Mitigation**:
  - **API Rate Limiting**: Implement a rate limiter in the Next.js `middleware.ts` using an in-memory or Redis-backed sliding window token bucket (e.g., `@upstash/ratelimit`). Limit authentication, feedback, profile updating, and agreement requests.
  - **Turnstile/CAPTCHA Integration**: Require a verified Cloudflare Turnstile token on the Sign-Up screen, the reporting form, and when initiating a roommate agreement.
  - **DDoS Shield**: Deploy the web application behind Cloudflare with WAF enabled to block known botnets, automated scraping scripts, and layer-7 request floods.
  - **Supabase Rate Limits**: Enable API gateway rate limiting on the Supabase dashboard (limiting requests per IP/minute to `/rest/v1` and `/auth/v1`).

### 5. Bot Accounts & Spamming
* **Threat**: Automated scripts registering fake accounts to harvest student details or post scam advertisements.
* **Mitigation**:
  - **Verify Email Address Domains**: Restrict sign-up email domains where possible, or enable double opt-in validation (SMTP verification link required). Ban common disposable email domains.
  - **Progressive Rate Limiting on Connections**: Cap the number of connection requests a profile can make to 5 per hour or 20 per day to stop profiles from bulk-connecting with everyone.
  - **Verified Student Constraints**: Limit key actions (creating feed posts, proposing agreements, and viewing listings) to accounts with `verification_status = 'VERIFIED'`.

### 6. SQL Injection (SQLi)
* **Threat**: Injecting malicious SQL syntax into user fields to bypass authentication or extract raw table databases.
* **Mitigation**:
  - Roomie avoids direct SQL strings in the application layer by utilizing Supabase JS client and Prisma ORM, which enforce parameterized inputs.
  - Ensure that no custom backend code dynamically concatenates raw user strings inside custom SQL scripts or `.query(...)` blocks.
  - Restrict the permissions of the Supabase postgres roles (`anon` and `authenticated`) so they cannot access system catalogs or execute database-level administrative routines.

### 7. Jacking (Clickjacking & Session Jacking)
* **Threat**: 
  - **Clickjacking**: A malicious site places the Roomie app inside a hidden iframe to trick students into performing actions like paying for agreements or disconnecting roommates.
  - **Session Jacking**: Stealing JWT tokens or cookies via cross-origin exploits.
* **Mitigation**:
  - **X-Frame-Options**: Enforce `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'` to block iframe embeds.
  - **Secure Cookie Flags**: Session cookies set by NextAuth or Supabase MUST use:
    - `HttpOnly`: Prevents JavaScript from reading the session token (mitigates XSS cookie theft).
    - `Secure`: Forces cookies to be sent only over HTTPS.
    - `SameSite=Lax` or `SameSite=Strict`: Protects against Cross-Site Request Forgery (CSRF).
