# Renter Passport (Shared Profiling)

Once a housing provider obtains a valid Roomie OAuth access token, they can retrieve the renter's shared profile passport. This eliminates duplicate onboarding forms by delivering verified data directly.

## Fetch Profile Endpoint
```http
GET https://api.roomie.ng/v1/oauth/userinfo
Authorization: Bearer <access_token>
```

---

## Response JSON Schema

The response includes individual profile fields, verification checks, lifestyle preferences, and details of their roommate connection:

```json
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
```

---

## Response Field Breakdown

### 1. Identity & Student Verification
*   `identity_status.student_verified`: Boolean showing if Roomie admin has verified their student ID.
*   `identity_status.verification_status`: Status of the verification (`UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`).

### 2. Demographics & Studies
*   `demographics.university`: The verified university they attend.
*   `demographics.year_of_study`: Integer representation of their academic year (helps select roommate matches).

### 3. Roommate Connection Details
*   `current_roommate_partner`: If the renter has paid and formed a roommate connection, their roommate's name and Roomie ID are enclosed here. Use this to establish a joint renter profile/agreement on your system.
