# Joint Checkout Consent

To protect co-roommates from unilateral lease breaking and deposit forfeitures, Roomie enforces a digital checkout consent workflow. Caution deposits are locked until both roommates confirm checkout and verify that no outstanding damages or shared bills exist.

## The Checkout Consent Lifecycle

```
[Roommate A]                                [Roommate B]                         [Landlord / Agency]
     │                                           │                                        │
     │ ─── 1. Initiates Moveout ────────────────>│                                        │
     │      (Date + Damage Checklist)            │                                        │
     │                                           │ ─── 2. Reviews Checklist ─────────────>│
     │                                           │      (Accepts or Rejects)              │
     │                                           │                                        │
     │ <────────────────── [APPROVED] ───────────│                                        │
     │                                           │ ─── 3. Fires Webhook: ────────────────>│
     │                                           │      `checkout.consent.approved`       │
     │                                           │                                        │
     │                                           │ <── 4. Caution Refund Auto-Split ──────│
```

---

## Create Checkout Request Endpoint
Housing platforms can check checkout requests or hook into the process to verify status before lease end:

```http
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
```

### Status Types:
*   `INITIATED`: Roommate A requested a checkout date; Roommate B hasn't signed off yet.
*   `REJECTED`: Roommate B rejected the request (e.g., claiming roommate broke a window or has unpaid electric bills).
*   `APPROVED`: Roommate B approved the checklist, signifying mutual consent.
*   `COMPLETED`: The housing provider processed the refund and closed the tenancy.

---

## Webhook: Checkout Approved Callback
Once the status transitions to `APPROVED`, Roomie triggers a webhook back to the housing provider:

```json
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
```
Upon receiving this webhook, the housing platform should initiate caution deposit transfers back to the roommates' registered Paystack accounts.
