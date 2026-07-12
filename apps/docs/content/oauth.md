# Roomie SSO Authentication (OAuth)

Roomie OAuth allows third-party housing providers to authenticate users and establish dual roommate accounts using the joint Roomie ID as the primary identifier.

## OAuth SSO Authorization Sequence

```
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
```

---

## Step 1: Redirect to Roomie SSO Page
Direct users to the Roomie SSO authorize endpoint when they click "Sign In with Roomie ID":

```http
GET https://platform.roomie.ng/oauth/authorize
    ?client_id=YOUR_CLIENT_ID
    &redirect_uri=YOUR_REDIRECT_URI
    &scope=profile:read%20verification:read
    &response_type=code
    &state=secure_random_state_string
```

### Request Parameters:
*   `client_id` (Required): The unique client UUID assigned to your housing platform.
*   `redirect_uri` (Required): The callback URL registered in your developer portal.
*   `scope` (Required): Space-separated list of scopes.
    *   `profile:read`: Access to renter passport basic profiles.
    *   `verification:read`: Access to student identity check status.
    *   `network:read`: Access to 1st/2nd degree mutual connection metrics.
*   `response_type` (Required): Must be set to `code`.
*   `state` (Recommended): A secure token to prevent Cross-Site Request Forgery (CSRF).

---

## Step 2: Swap Authorization Code for Access Token
Upon approval, Roomie redirects back to your `redirect_uri` with a `code` query parameter. Exchange this code for an access token within **5 minutes**:

### Request:
```http
POST https://api.roomie.ng/v1/oauth/token
Content-Type: application/json

{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "AUTH_CODE_RECEIVED",
  "redirect_uri": "YOUR_REDIRECT_URI"
}
```

### Response Shape:
```json
{
  "access_token": "rm_atk_89a7f34be...",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "rm_rtk_c48ef290b...",
  "scope": ["profile:read", "verification:read"]
}
```
*   `access_token` is valid for 15 minutes. Use the `refresh_token` (valid for 7 days) to request new access tokens.
