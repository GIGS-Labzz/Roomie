# Getting Started with Roomie Platform

Welcome to the **Roomie Developer Platform** (`platform.roomie`). This developer hub provides documentation and integration guides for housing providers to connect their platforms with Roomie's core ecosystem.

## Why Integrate with Roomie?

Roomie is the leading co-living platform for students and young professionals. By integrating our REST APIs, your housing agency or accommodation booking platform can:
1. **Reduce Lead Time & Friction**: Avoid repetitive forms. Students can authenticate and share their verified renter profile in one click.
2. **Streamline Shared Tenancy**: Joint renter passport details (budget ranges, lifestyle matches, university verifications) are transmitted securely together.
3. **Automate Rent & Caution Splits**: Automatically routes payments from individual roommate bank accounts using Paystack's Subaccount API splits.
4. **Enforce Safety Safeguards**: Coordinate move-outs via joint digital checkout consent before deposit refunds are unlocked.

---

## Core Platform Integration Steps

To establish a verified partnership on the Roomie Developer Platform, housing providers must integrate the following core logic modules:

```
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
```

1. **Roomie SSO (OAuth)**: Embed the "Connect with Roomie ID" button on your sign-up/check-out page to register joint tenancy applicants.
2. **Renter Passport**: Pull verified profile fields (student ID checks, age, gender, partner IDs) to establish dual renter profiles automatically.
3. **Split Payments**: Setup Paystack subaccount configurations so booking fees and rental bills are shared.
4. **Checkout Consent**: Sync checkout dates and condition audits between co-roommates before caution deposits are split and paid back.

---

## Quickstart Sandbox

Use the **Developer Sandbox** tab in this console to interactively simulate OAuth authorization, inspect Renter Passport JSON shapes, calculate rental split ratios, and receive mock checkout webhooks.
