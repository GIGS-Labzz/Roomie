# Shared Payments & Auto-Splits

Co-living roommates require coordinated financial splitting for high-value housing fees (booking deposits, monthly rent, and caution deposits). Roomie integrates with Paystack's Subaccount API to execute auto-split routing.

## Payment Flow Workflow

```
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
```

---

## Split Configuration & Webhook Rules

### 1. Invoice Initialization
When initializing a shared payment split, the housing provider posts the bill splits configuration to Roomie:

```http
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
```

### 2. Rent Clearance Webhook
Once both roommates have paid their respective sub-portions via their individual accounts, Roomie fires a webhook callback to the housing provider:

```json
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
```

---

## Escrow Caution Deposit Auto-Refunds
When caution deposits are returned at the end of the tenancy, they are refunded in the exact ratio that was paid (e.g. 50/50 or 60/40), preventing disputes. This refund is triggered automatically once joint **Checkout Consent** is approved.
