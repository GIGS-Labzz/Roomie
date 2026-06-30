-- Give all seed test users an email/password so they can sign in during testing.
-- Password for every seed account: Test@1234
-- Only touches accounts with @seed.roomie.ng email — never affects real users.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE auth.users
SET
  encrypted_password  = extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)),
  email_confirmed_at  = COALESCE(email_confirmed_at, NOW()),
  updated_at          = NOW()
WHERE email LIKE '%@seed.roomie.ng';
