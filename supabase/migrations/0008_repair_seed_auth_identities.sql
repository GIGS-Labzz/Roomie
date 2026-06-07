-- Repair seed users that were inserted directly into auth.users.
-- Supabase Auth expects email users to have matching auth.identities rows,
-- email provider metadata, and empty token strings instead of NULL.

WITH seed_auth_users(id) AS (
  VALUES
    ('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa'::uuid),
    ('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa'::uuid),
    ('aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa'::uuid),
    ('aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa'::uuid),
    ('aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa'::uuid),
    ('bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb'::uuid),
    ('11111111-0001-0001-0001-000000000001'::uuid),
    ('11111111-0002-0002-0002-000000000002'::uuid),
    ('11111111-0003-0003-0003-000000000003'::uuid),
    ('11111111-0004-0004-0004-000000000004'::uuid),
    ('11111111-0005-0005-0005-000000000005'::uuid),
    ('11111111-0006-0006-0006-000000000006'::uuid),
    ('11111111-0007-0007-0007-000000000007'::uuid),
    ('11111111-0008-0008-0008-000000000008'::uuid),
    ('11111111-0009-0009-0009-000000000009'::uuid),
    ('11111111-0010-0010-0010-000000000010'::uuid),
    ('11111111-0011-0011-0011-000000000011'::uuid),
    ('11111111-0012-0012-0012-000000000012'::uuid),
    ('11111111-0013-0013-0013-000000000013'::uuid),
    ('11111111-0014-0014-0014-000000000014'::uuid),
    ('11111111-0015-0015-0015-000000000015'::uuid),
    ('11111111-0016-0016-0016-000000000016'::uuid),
    ('11111111-0017-0017-0017-000000000017'::uuid),
    ('11111111-0018-0018-0018-000000000018'::uuid),
    ('11111111-0019-0019-0019-000000000019'::uuid),
    ('11111111-0020-0020-0020-000000000020'::uuid),
    ('11111111-0021-0021-0021-000000000021'::uuid),
    ('11111111-0022-0022-0022-000000000022'::uuid),
    ('11111111-0023-0023-0023-000000000023'::uuid),
    ('11111111-0024-0024-0024-000000000024'::uuid),
    ('11111111-0025-0025-0025-000000000025'::uuid)
)
UPDATE auth.users AS users
SET
  raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
  raw_user_meta_data = COALESCE(users.raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('email_verified', true),
  confirmation_token = COALESCE(users.confirmation_token, ''),
  recovery_token = COALESCE(users.recovery_token, ''),
  email_change_token_new = COALESCE(users.email_change_token_new, ''),
  email_change = COALESCE(users.email_change, ''),
  email_change_token_current = COALESCE(users.email_change_token_current, ''),
  phone_change = COALESCE(users.phone_change, ''),
  phone_change_token = COALESCE(users.phone_change_token, ''),
  reauthentication_token = COALESCE(users.reauthentication_token, ''),
  updated_at = NOW()
FROM seed_auth_users
WHERE users.id = seed_auth_users.id;

WITH seed_auth_users(id) AS (
  VALUES
    ('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa'::uuid),
    ('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa'::uuid),
    ('aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa'::uuid),
    ('aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa'::uuid),
    ('aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa'::uuid),
    ('bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb'::uuid),
    ('11111111-0001-0001-0001-000000000001'::uuid),
    ('11111111-0002-0002-0002-000000000002'::uuid),
    ('11111111-0003-0003-0003-000000000003'::uuid),
    ('11111111-0004-0004-0004-000000000004'::uuid),
    ('11111111-0005-0005-0005-000000000005'::uuid),
    ('11111111-0006-0006-0006-000000000006'::uuid),
    ('11111111-0007-0007-0007-000000000007'::uuid),
    ('11111111-0008-0008-0008-000000000008'::uuid),
    ('11111111-0009-0009-0009-000000000009'::uuid),
    ('11111111-0010-0010-0010-000000000010'::uuid),
    ('11111111-0011-0011-0011-000000000011'::uuid),
    ('11111111-0012-0012-0012-000000000012'::uuid),
    ('11111111-0013-0013-0013-000000000013'::uuid),
    ('11111111-0014-0014-0014-000000000014'::uuid),
    ('11111111-0015-0015-0015-000000000015'::uuid),
    ('11111111-0016-0016-0016-000000000016'::uuid),
    ('11111111-0017-0017-0017-000000000017'::uuid),
    ('11111111-0018-0018-0018-000000000018'::uuid),
    ('11111111-0019-0019-0019-000000000019'::uuid),
    ('11111111-0020-0020-0020-000000000020'::uuid),
    ('11111111-0021-0021-0021-000000000021'::uuid),
    ('11111111-0022-0022-0022-000000000022'::uuid),
    ('11111111-0023-0023-0023-000000000023'::uuid),
    ('11111111-0024-0024-0024-000000000024'::uuid),
    ('11111111-0025-0025-0025-000000000025'::uuid)
)
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
SELECT
  users.id::text,
  users.id,
  jsonb_build_object(
    'sub', users.id::text,
    'email', users.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  NOW(),
  NOW()
FROM auth.users AS users
JOIN seed_auth_users ON seed_auth_users.id = users.id
ON CONFLICT (provider_id, provider) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  identity_data = EXCLUDED.identity_data,
  updated_at = NOW();
