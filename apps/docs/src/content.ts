export const DOCS_CONTENT: Record<string, string> = {
  intro: `# Getting Started with Roomie Platform

Welcome to the **Roomie Developer Platform** (\`platform.roomie\`). This developer hub provides documentation and integration guides for housing providers to connect their platforms with Roomie's core ecosystem.

## Why Integrate with Roomie?

Roomie is the leading co-living platform for students and young professionals. By integrating our REST APIs, your housing agency or accommodation booking platform can:
1. **Reduce Lead Time & Friction**: Avoid repetitive forms. Students can authenticate and share their verified renter profile in one click.
2. **Streamline Shared Tenancy**: Joint renter passport details (budget ranges, lifestyle matches, university verifications) are transmitted securely together.
3. **Automate Rent & Caution Splits**: Automatically routes payments from individual roommate bank accounts using Paystack's Subaccount API splits.
4. **Enforce Safety Safeguards**: Coordinate move-outs via joint digital checkout consent before deposit refunds are unlocked.

---

## Core Platform Integration Steps

To establish a verified partnership on the Roomie Developer Platform, housing providers must integrate the following core logic modules:

\`\`\`
┌────────────────────────────────────────────────────────────────────────┐
│                        HOUSING PROVIDER FLOW                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  [1] Roomie SSO Auth & Renter Passport
                                    │
                                    ▼
                  [2] Auto-Split Payments / Rent Splits
                                    │
                                    ▼
                  [3] Joint Roommate Checkout Consent
\`\`\`

1. **Roomie SSO (OAuth)**: Embed the "Connect with Roomie ID" button on your sign-up/check-out page to register joint tenancy applicants.
2. **Renter Passport**: Pull verified profile fields (student ID checks, age, gender, partner IDs) to establish dual renter profiles automatically.
3. **Split Payments**: Setup Paystack subaccount configurations so booking fees and rental bills are shared.
4. **Checkout Consent**: Sync checkout dates and condition audits between co-roommates before caution deposits are split and paid back.

---

## Quickstart Sandbox

Use the **Developer Sandbox** tab in this console to interactively simulate OAuth authorization, inspect Renter Passport JSON shapes, calculate rental split ratios, and receive mock checkout webhooks.`,

  oauth: `# Roomie SSO Authentication (OAuth)

Roomie OAuth allows third-party housing providers to authenticate users and establish dual roommate accounts using the joint Roomie ID as the primary identifier.

## OAuth SSO Authorization Sequence

\`\`\`
[User Browser]            [Partner Housing Site]        [Roomie OAuth Auth Server]
      │                              │                               │
      │ ─── 1. Click SSO Link ─────> │                               │
      │                              │ ─── 2. Redirect to Auth ────> │
      │ <── 3. Prompt for Login ──── │                               │
      │ ─── 4. Consent to Scopes ──> │                               │
      │                              │ <── 5. Auth Code (?code=X) ── │
      │ <── 6. Deliver Auth Code ─── │                               │
      │                              │ ─── 7. POST /api/oauth/token  │
      │                              │ <── 8. Access Token ───────── │
\`\`\`

---

## Step 1: Redirect to Roomie SSO Page
Direct users to the Roomie SSO authorize endpoint when they click "Sign In with Roomie ID":

\`\`\`http
GET https://platform.roomie.ng/oauth/authorize
    ?client_id=YOUR_CLIENT_ID
    &redirect_uri=YOUR_REDIRECT_URI
    &scope=profile:read%20verification:read
    &response_type=code
    &state=secure_random_state_string
\`\`\`

### Request Parameters:
*   \`client_id\` (Required): The unique client UUID assigned to your housing platform.
*   \`redirect_uri\` (Required): The callback URL registered in your developer portal.
*   \`scope\` (Required): Space-separated list of scopes.
    *   \`profile:read\`: Access to renter passport basic profiles.
    *   \`verification:read\`: Access to student identity check status.
    *   \`network:read\`: Access to 1st/2nd degree mutual connection metrics.
*   \`response_type\` (Required): Must be set to \`code\`.
*   \`state\` (Recommended): A secure token to prevent Cross-Site Request Forgery (CSRF).

---

## Step 2: Swap Authorization Code for Access Token
Upon approval, Roomie redirects back to your \`redirect_uri\` with a \`code\` query parameter. Exchange this code for an access token within **5 minutes**:

### Request:
\`\`\`http
POST https://api.roomie.ng/v1/oauth/token
Content-Type: application/json

{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "AUTH_CODE_RECEIVED",
  "redirect_uri": "YOUR_REDIRECT_URI"
}
\`\`\`

### Response Shape:
\`\`\`json
{
  "access_token": "rm_atk_89a7f34be...",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "rm_rtk_c48ef290b...",
  "scope": ["profile:read", "verification:read"]
}
\`\`\`
*   \`access_token\` is valid for 15 minutes. Use the \`refresh_token\` (valid for 7 days) to request new access tokens.`,

  passport: `# Renter Passport (Shared Profiling)

Once a housing provider obtains a valid Roomie OAuth access token, they can retrieve the renter's shared profile passport. This eliminates duplicate onboarding forms by delivering verified data directly.

## Fetch Profile Endpoint
\`\`\`http
GET https://api.roomie.ng/v1/oauth/userinfo
Authorization: Bearer <access_token>
\`\`\`

---

## Response JSON Schema

The response includes individual profile fields, verification checks, lifestyle preferences, and details of their roommate connection:

\`\`\`json
{
  "roomie_id": "@john_doe",
  "display_name": "John Doe",
  "email": "john@unilag.edu.ng",
  "identity_status": {
    "student_verified": true,
    "verification_status": "VERIFIED",
    "verified_at": "2026-06-15T12:00:00Z"
  },
  "demographics": {
    "age": 21,
    "gender": "male",
    "university": "UNILAG",
    "faculty": "Science",
    "year_of_study": 3
  },
  "preferences": {
    "min_budget": 80000,
    "max_budget": 150000,
    "lifestyle_tags": ["quiet", "no_smoking", "tidy"]
  },
  "current_roommate_partner": {
    "id": "partner-uuid-123",
    "roomie_id": "@jane_smith",
    "display_name": "Jane Smith"
  }
}
\`\`\`

---

## Response Field Breakdown

### 1. Identity & Student Verification
*   \`identity_status.student_verified\`: Boolean showing if Roomie admin has verified their student ID.
*   \`identity_status.verification_status\`: Status of the verification (\`UNVERIFIED\`, \`PENDING\`, \`VERIFIED\`, \`REJECTED\`).

### 2. Demographics & Studies
*   \`demographics.university\`: The verified university they attend.
*   \`demographics.year_of_study\`: Integer representation of their academic year (helps select roommate matches).

### 3. Roommate Connection Details
*   \`current_roommate_partner\`: If the renter has paid and formed a roommate connection, their roommate's name and Roomie ID are enclosed here. Use this to establish a joint renter profile/agreement on your system.`,

  splits: `# Shared Payments & Auto-Splits

Co-living roommates require coordinated financial splitting for high-value housing fees (booking deposits, monthly rent, and caution deposits). Roomie integrates with Paystack's Subaccount API to execute auto-split routing.

## Payment Flow Workflow

\`\`\`
            Housing Provider Issues Rent Invoice (₦400,000)
                                 │
                                 ▼
                     [Roomie Auto-Split Rules]
                                 │
        ┌────────────────────────┴────────────────────────┐
        ▼                                                 ▼
  Roommate A (50%)                                  Roommate B (50%)
     (₦200,000)                                        (₦200,000)
        │                                                 │
        ▼                                                 ▼
 Paystack Subaccount A                             Paystack Subaccount B
        │                                                 │
        └────────────────────────┬────────────────────────┘
                                 ▼
                  [Invoice Status: Fully Cleared]
                                 │
                                 ▼
            Webook Sent to Landlord/Agency confirming payment
\`\`\`

---

## Split Configuration & Webhook Rules

### 1. Invoice Initialization
When initializing a shared payment split, the housing provider posts the bill splits configuration to Roomie:

\`\`\`http
POST https://api.roomie.ng/v1/splits
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "connection_id": "roommate-connection-uuid",
  "title": "August Rent Invoice - Apartment 4B",
  "total_amount": 40000000,
  "currency": "NGN",
  "is_housing_fee": true,
  "payment_reference": "landlord-tracking-ref-98213",
  "split_ratio": {
    "initiator": 0.5,
    "acceptor": 0.5
  }
}
\`\`\`

### 2. Rent Clearance Webhook
Once both roommates have paid their respective sub-portions via their individual accounts, Roomie fires a webhook callback to the housing provider:

\`\`\`json
{
  "event": "split.payment.cleared",
  "data": {
    "payment_reference": "landlord-tracking-ref-98213",
    "total_amount": 40000000,
    "status": "SUCCESS",
    "cleared_at": "2026-07-10T14:45:00Z",
    "splits": [
      {
        "user_id": "user-uuid-a",
        "amount_paid": 20000000,
        "channel": "card"
      },
      {
        "user_id": "user-uuid-b",
        "amount_paid": 20000000,
        "channel": "bank_transfer"
      }
    ]
  }
}
\`\`\`

---

## Escrow Caution Deposit Auto-Refunds
When caution deposits are returned at the end of the tenancy, they are refunded in the exact ratio that was paid (e.g. 50/50 or 60/40), preventing disputes. This refund is triggered automatically once joint **Checkout Consent** is approved.`,

  checkout: `# Joint Checkout Consent

To protect co-roommates from unilateral lease breaking and deposit forfeitures, Roomie enforces a digital checkout consent workflow. Caution deposits are locked until both roommates confirm checkout and verify that no outstanding damages or shared bills exist.

## The Checkout Consent Lifecycle

\`\`\`
[Roommate A]                                [Roommate B]                         [Landlord / Agency]
     │                                           │                                        │
     │ ─── 1. Initiates Moveout ────────────────>│                                        │
     │      (Date + Damage Checklist)            │                                        │
     │                                           │ ─── 2. Reviews Checklist ─────────────>│
     │                                           │      (Accepts or Rejects)              │
     │                                           │                                        │
     │ <────────────────── [APPROVED] ───────────│                                        │
     │                                           │ ─── 3. Fires Webhook: ────────────────>│
     │                                           │      \`checkout.consent.approved\`       │
     │                                           │                                        │
     │                                           │ <── 4. Caution Refund Auto-Split ──────│
\`\`\`

---

## Create Checkout Request Endpoint
Housing platforms can check checkout requests or hook into the process to verify status before lease end:

\`\`\`http
POST https://api.roomie.ng/v1/checkout/consent
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "connection_id": "roommate-connection-uuid",
  "checkout_date": "2026-08-31",
  "checklist": {
    "bills_settled": true,
    "keys_returned": true,
    "no_damages": true
  }
}
\`\`\`

### Status Types:
*   \`INITIATED\`: Roommate A requested a checkout date; Roommate B hasn't signed off yet.
*   \`REJECTED\`: Roommate B rejected the request (e.g., claiming roommate broke a window or has unpaid electric bills).
*   \`APPROVED\`: Roommate B approved the checklist, signifying mutual consent.
*   \`COMPLETED\`: The housing provider processed the refund and closed the tenancy.

---

## Webhook: Checkout Approved Callback
Once the status transitions to \`APPROVED\`, Roomie triggers a webhook back to the housing provider:

\`\`\`json
{
  "event": "checkout.consent.approved",
  "data": {
    "checkout_request_id": "checkout-uuid-8712",
    "connection_id": "roommate-connection-uuid",
    "checkout_date": "2026-08-31",
    "checklist": {
      "bills_settled": true,
      "keys_returned": true,
      "no_damages": true
    },
    "split_refund_ratio": {
      "initiator": 0.5,
      "acceptor": 0.5
    }
  }
}
\`\`\`
Upon receiving this webhook, the housing platform should initiate caution deposit transfers back to the roommates' registered Paystack accounts.`,

  network: `# Mutual Connections & Safety Network

To build a trusted student community, Roomie maps connection hierarchies between roommates. If two users lived together or signed roommate agreements, they form a **1st-Degree Connection**. A roommate of a roommate is a **2nd-Degree Connection**.

Housing platforms can check mutual connection numbers between applicants to evaluate social safety indicators.

## Fetch Mutual Connections Endpoint
\`\`\`http
GET https://api.roomie.ng/v1/network/mutual/:userId
Authorization: Bearer <access_token>
\`\`\`

---

## Response JSON Schema

Returns an array of profiles that represent shared 1st-degree connections (co-tenants) with the user:

\`\`\`json
[
  {
    "id": "profile-uuid-abc",
    "display_name": "Daniel Adewale",
    "avatar_url": "https://storage.roomie.ng/avatars/daniel.jpg",
    "university": "UNILAG",
    "verified_student": true,
    "connected_since": "2025-09-01T10:00:00Z"
  },
  {
    "id": "profile-uuid-def",
    "display_name": "Chidi Nwachukwu",
    "avatar_url": "https://storage.roomie.ng/avatars/chidi.jpg",
    "university": "UNILAG",
    "verified_student": true,
    "connected_since": "2026-01-15T14:30:00Z"
  }
]
\`\`\`

---

## Integration Benefits
*   \`Vouching Score\`: Displays indicators such as *"Matched with 2 mutual connections"* on rental profiles, increasing landlord trust.
*   \`Fraud Reduction\`: Validates real co-living histories rather than self-reported references.`
};
