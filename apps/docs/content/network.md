# Mutual Connections & Safety Network

To build a trusted student community, Roomie maps connection hierarchies between roommates. If two users lived together or signed roommate agreements, they form a **1st-Degree Connection**. A roommate of a roommate is a **2nd-Degree Connection**.

Housing platforms can check mutual connection numbers between applicants to evaluate social safety indicators.

## Fetch Mutual Connections Endpoint
```http
GET https://api.roomie.ng/v1/network/mutual/:userId
Authorization: Bearer <access_token>
```

---

## Response JSON Schema

Returns an array of profiles that represent shared 1st-degree connections (co-tenants) with the user:

```json
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
```

---

## Integration Benefits
*   **Vouching Score**: Displays indicators such as *"Matched with 2 mutual connections"* on rental profiles, increasing landlord trust.
*   **Fraud Reduction**: Validates real co-living histories rather than self-reported references.
