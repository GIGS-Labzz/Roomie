-- Seed data for local development
-- Applied on: supabase db reset

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Housing Platform Auth Users ─────────────────────────────────────────────
-- All platform accounts use password: Test@1234
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, raw_user_meta_data, is_anonymous)
VALUES
  ('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'contact@unihousing.ng', extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"UniHousing Lagos","user_type":"provider"}'::jsonb, FALSE),
  ('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'hello@abujapad.ng',     extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"AbujaStudentPad","user_type":"provider"}'::jsonb,  FALSE),
  ('aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'info@unicrib.ng',       extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"UniCrib Ibadan","user_type":"provider"}'::jsonb,   FALSE),
  ('aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'rooms@phrooms.ng',      extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"PortHarcourt Rooms","user_type":"provider"}'::jsonb,FALSE),
  ('aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'contact@enuguhomes.ng', extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"EnuguStudentHomes","user_type":"provider"}'::jsonb, FALSE)
ON CONFLICT (id) DO NOTHING;

-- ─── Super Admin Auth User ────────────────────────────────────────────────────
-- Super admin: admin@roomie.ng / Admin@1234
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, raw_user_meta_data, is_anonymous)
VALUES
  ('bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'admin@roomie.ng', extensions.crypt('Admin@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Roomie Super Admin","user_type":"admin"}'::jsonb, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.admin_users (id, role)
VALUES ('bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', 'super_admin')
ON CONFLICT (id) DO NOTHING;

-- ─── Sample Housing Platforms ────────────────────────────────────────────────
INSERT INTO public.housing_platforms (name, description, url, cities, campus_tags, contact_email, status, is_featured)
VALUES
  ('UniHousing Lagos',   'Student accommodation near UNILAG and LASU', 'https://example.com/unihousing', ARRAY['Lagos'],          ARRAY['UNILAG','LASU','Yaba'], 'contact@unihousing.ng', 'PENDING_REVIEW', FALSE),
  ('AbujaStudentPad',    'Affordable rooms near UniAbuja and BAZE',      'https://example.com/abujapad',   ARRAY['Abuja'],          ARRAY['UNIABUJA','BAZE'],      'hello@abujapad.ng',     'PENDING_REVIEW', FALSE),
  ('UniCrib Ibadan',     'Hostels and self-cons near UI and LAUTECH',    'https://example.com/unicrib',    ARRAY['Ibadan'],         ARRAY['UI','LAUTECH'],         'info@unicrib.ng',       'PENDING_REVIEW', FALSE),
  ('PortHarcourt Rooms', 'Student rooms near RSU and UniPort',           'https://example.com/phrooms',    ARRAY['Port Harcourt'],  ARRAY['RSU','UNIPORT'],        'rooms@phrooms.ng',      'PENDING_REVIEW', FALSE),
  ('EnuguStudentHomes',  'UNN and Enugu State student accommodation',    'https://example.com/enuguhomes', ARRAY['Enugu','Nsukka'], ARRAY['UNN','ESUT'],           'contact@enuguhomes.ng', 'PENDING_REVIEW', FALSE);

-- ─── 25 Sample Profiles ───────────────────────────────────────────────────────
-- We insert directly into auth.users first (bypassing the trigger),
-- then insert into public.profiles with full data.
-- UUIDs are fixed so seed is idempotent.

DO $$
DECLARE
  uid1  UUID := '11111111-0001-0001-0001-000000000001';
  uid2  UUID := '11111111-0002-0002-0002-000000000002';
  uid3  UUID := '11111111-0003-0003-0003-000000000003';
  uid4  UUID := '11111111-0004-0004-0004-000000000004';
  uid5  UUID := '11111111-0005-0005-0005-000000000005';
  uid6  UUID := '11111111-0006-0006-0006-000000000006';
  uid7  UUID := '11111111-0007-0007-0007-000000000007';
  uid8  UUID := '11111111-0008-0008-0008-000000000008';
  uid9  UUID := '11111111-0009-0009-0009-000000000009';
  uid10 UUID := '11111111-0010-0010-0010-000000000010';
  uid11 UUID := '11111111-0011-0011-0011-000000000011';
  uid12 UUID := '11111111-0012-0012-0012-000000000012';
  uid13 UUID := '11111111-0013-0013-0013-000000000013';
  uid14 UUID := '11111111-0014-0014-0014-000000000014';
  uid15 UUID := '11111111-0015-0015-0015-000000000015';
  uid16 UUID := '11111111-0016-0016-0016-000000000016';
  uid17 UUID := '11111111-0017-0017-0017-000000000017';
  uid18 UUID := '11111111-0018-0018-0018-000000000018';
  uid19 UUID := '11111111-0019-0019-0019-000000000019';
  uid20 UUID := '11111111-0020-0020-0020-000000000020';
  uid21 UUID := '11111111-0021-0021-0021-000000000021';
  uid22 UUID := '11111111-0022-0022-0022-000000000022';
  uid23 UUID := '11111111-0023-0023-0023-000000000023';
  uid24 UUID := '11111111-0024-0024-0024-000000000024';
  uid25 UUID := '11111111-0025-0025-0025-000000000025';
BEGIN

-- ── Insert auth.users (with password for testing) ────────────────────────────
-- All seed accounts use password: Test@1234
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, raw_user_meta_data, is_anonymous)
VALUES
  (uid1,  'amara.okafor@seed.roomie.ng',    extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Amara Okafor",   "avatar_url":"https://i.pravatar.cc/150?img=1"}'::jsonb,  FALSE),
  (uid2,  'emeka.nwosu@seed.roomie.ng',     extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Emeka Nwosu",    "avatar_url":"https://i.pravatar.cc/150?img=3"}'::jsonb,  FALSE),
  (uid3,  'fatimah.bello@seed.roomie.ng',   extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Fatimah Bello",  "avatar_url":"https://i.pravatar.cc/150?img=5"}'::jsonb,  FALSE),
  (uid4,  'chidi.eze@seed.roomie.ng',       extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Chidi Eze",      "avatar_url":"https://i.pravatar.cc/150?img=7"}'::jsonb,  FALSE),
  (uid5,  'ngozi.adeyemi@seed.roomie.ng',   extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Ngozi Adeyemi",  "avatar_url":"https://i.pravatar.cc/150?img=9"}'::jsonb,  FALSE),
  (uid6,  'tunde.afolabi@seed.roomie.ng',   extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Tunde Afolabi",  "avatar_url":"https://i.pravatar.cc/150?img=11"}'::jsonb, FALSE),
  (uid7,  'adaeze.okoro@seed.roomie.ng',    extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Adaeze Okoro",   "avatar_url":"https://i.pravatar.cc/150?img=13"}'::jsonb, FALSE),
  (uid8,  'ibrahim.musa@seed.roomie.ng',    extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Ibrahim Musa",   "avatar_url":"https://i.pravatar.cc/150?img=15"}'::jsonb, FALSE),
  (uid9,  'chioma.nwachukwu@seed.roomie.ng',extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Chioma Nwachukwu","avatar_url":"https://i.pravatar.cc/150?img=17"}'::jsonb,FALSE),
  (uid10, 'segun.olawale@seed.roomie.ng',   extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Segun Olawale",  "avatar_url":"https://i.pravatar.cc/150?img=19"}'::jsonb, FALSE),
  (uid11, 'kemi.adebayo@seed.roomie.ng',    extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Kemi Adebayo",   "avatar_url":"https://i.pravatar.cc/150?img=21"}'::jsonb, FALSE),
  (uid12, 'uche.obiechina@seed.roomie.ng',  extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Uche Obiechina", "avatar_url":"https://i.pravatar.cc/150?img=23"}'::jsonb, FALSE),
  (uid13, 'halima.abdullahi@seed.roomie.ng',extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Halima Abdullahi","avatar_url":"https://i.pravatar.cc/150?img=25"}'::jsonb,FALSE),
  (uid14, 'david.akintola@seed.roomie.ng',  extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"David Akintola", "avatar_url":"https://i.pravatar.cc/150?img=27"}'::jsonb, FALSE),
  (uid15, 'blessing.onyeka@seed.roomie.ng', extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Blessing Onyeka","avatar_url":"https://i.pravatar.cc/150?img=29"}'::jsonb, FALSE),
  (uid16, 'michael.obi@seed.roomie.ng',     extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Michael Obi",    "avatar_url":"https://i.pravatar.cc/150?img=31"}'::jsonb, FALSE),
  (uid17, 'sade.fashola@seed.roomie.ng',    extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Sade Fashola",   "avatar_url":"https://i.pravatar.cc/150?img=33"}'::jsonb, FALSE),
  (uid18, 'kenny.okonkwo@seed.roomie.ng',   extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Kenny Okonkwo",  "avatar_url":"https://i.pravatar.cc/150?img=35"}'::jsonb, FALSE),
  (uid19, 'nkechi.okafor@seed.roomie.ng',   extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Nkechi Okafor",  "avatar_url":"https://i.pravatar.cc/150?img=37"}'::jsonb, FALSE),
  (uid20, 'frank.egwuatu@seed.roomie.ng',   extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Frank Egwuatu",  "avatar_url":"https://i.pravatar.cc/150?img=39"}'::jsonb, FALSE),
  (uid21, 'yetunde.balogun@seed.roomie.ng', extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Yetunde Balogun","avatar_url":"https://i.pravatar.cc/150?img=41"}'::jsonb, FALSE),
  (uid22, 'chuka.anyanwu@seed.roomie.ng',   extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Chuka Anyanwu",  "avatar_url":"https://i.pravatar.cc/150?img=43"}'::jsonb, FALSE),
  (uid23, 'aisha.garba@seed.roomie.ng',     extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Aisha Garba",    "avatar_url":"https://i.pravatar.cc/150?img=45"}'::jsonb, FALSE),
  (uid24, 'rotimi.adeleke@seed.roomie.ng',  extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Rotimi Adeleke", "avatar_url":"https://i.pravatar.cc/150?img=47"}'::jsonb, FALSE),
  (uid25, 'obiageli.nwobi@seed.roomie.ng',  extensions.crypt('Test@1234', extensions.gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated', NOW(), NOW(), '{"full_name":"Obiageli Nwobi", "avatar_url":"https://i.pravatar.cc/150?img=49"}'::jsonb, FALSE)
ON CONFLICT (id) DO NOTHING;

-- ── Insert profiles ───────────────────────────────────────────────────────────
INSERT INTO public.profiles (
  id, display_name, avatar_url, bio, age, gender,
  city, state, university, faculty, course, year_of_study,
  min_budget, max_budget, move_in_date,
  lifestyle_tags, sleep_schedule, cleanliness, noise_pref,
  allows_smoking, allows_pets, allows_guests,
  roommate_gender_pref, student_verified, verification_status,
  onboarding_step, onboarding_complete, is_active, last_seen_at
)
VALUES
-- 1. Amara Okafor — Lagos, UNILAG, early bird, very tidy, wants female
(uid1, 'Amara Okafor', 'https://i.pravatar.cc/150?img=1',
 'Business Admin student from Kano. Tidy, quiet, early to bed. Looking for a calm female roommate near UNILAG.',
 19, 'female', 'Lagos', 'Lagos State',
 'UNILAG', 'Business Administration', 'Business Administration', 2,
 70000, 120000, '2026-07-01',
 ARRAY['studious','homebody','religious'], 'early_bird', 'very_tidy', 'quiet',
 FALSE, FALSE, TRUE, 'female', TRUE, 'VERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '2 hours'),

-- 2. Emeka Nwosu — Abuja, UniAbuja, night owl, relaxed, wants male
(uid2, 'Emeka Nwosu', 'https://i.pravatar.cc/150?img=3',
 'Computer Science 300L. Night owl, workaholic. Need someone cool with late-night laptop sessions.',
 21, 'male', 'Abuja', 'FCT',
 'UNIABUJA', 'Science', 'Computer Science', 3,
 50000, 80000, '2026-08-01',
 ARRAY['gamer','studious','homebody'], 'night_owl', 'relaxed', 'moderate',
 FALSE, FALSE, FALSE, 'male', FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '1 hour'),

-- 3. Fatimah Bello — Lagos, UNILAG, early bird, tidy, female
(uid3, 'Fatimah Bello', 'https://i.pravatar.cc/150?img=5',
 'Pharmacy 200L. Non-smoker, devout, very organised. Would love a like-minded female roommate.',
 20, 'female', 'Lagos', 'Lagos State',
 'UNILAG', 'Pharmacy', 'Pharmacy', 2,
 60000, 100000, '2026-07-01',
 ARRAY['religious','studious','homebody'], 'early_bird', 'tidy', 'very_quiet',
 FALSE, FALSE, FALSE, 'female', TRUE, 'VERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '30 minutes'),

-- 4. Chidi Eze — Enugu, UNN, flexible, tidy, male
(uid4, 'Chidi Eze', 'https://i.pravatar.cc/150?img=7',
 'Engineering student at UNN. Love cooking and football. Easy to live with, just keep the kitchen clean!',
 22, 'male', 'Enugu', 'Enugu State',
 'UNN', 'Engineering', 'Mechanical Engineering', 4,
 40000, 70000, '2026-09-01',
 ARRAY['foodie','social','athletic'], 'flexible', 'tidy', 'moderate',
 FALSE, FALSE, TRUE, 'male', FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '3 hours'),

-- 5. Ngozi Adeyemi — Ibadan, UI, night owl, very tidy, female
(uid5, 'Ngozi Adeyemi', 'https://i.pravatar.cc/150?img=9',
 'Law student at UI. Bookworm and late-night studier. Need a quiet, clean female roommate.',
 23, 'female', 'Ibadan', 'Oyo State',
 'UI', 'Law', 'Law', 5,
 55000, 90000, '2026-07-01',
 ARRAY['studious','homebody','traveler'], 'night_owl', 'very_tidy', 'very_quiet',
 FALSE, FALSE, FALSE, 'female', TRUE, 'VERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '45 minutes'),

-- 6. Tunde Afolabi — Lagos, LASU, flexible, relaxed, male
(uid6, 'Tunde Afolabi', 'https://i.pravatar.cc/150?img=11',
 'Mass Comm 300L at LASU. Social butterfly. Happy to have friends over on weekends.',
 21, 'male', 'Lagos', 'Lagos State',
 'LASU', 'Arts and Social Sciences', 'Mass Communication', 3,
 45000, 75000, '2026-08-01',
 ARRAY['social','traveler','foodie'], 'flexible', 'relaxed', 'lively',
 FALSE, FALSE, TRUE, NULL, FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '5 hours'),

-- 7. Adaeze Okoro — Port Harcourt, UNIPORT, early bird, very tidy, female
(uid7, 'Adaeze Okoro', 'https://i.pravatar.cc/150?img=13',
 'Medical student at UNIPORT. Disciplined and early riser. Want a serious, tidy female roommate.',
 22, 'female', 'Port Harcourt', 'Rivers State',
 'UNIPORT', 'Medicine', 'Medicine and Surgery', 3,
 80000, 150000, '2026-07-01',
 ARRAY['studious','religious','homebody'], 'early_bird', 'very_tidy', 'quiet',
 FALSE, FALSE, FALSE, 'female', TRUE, 'VERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '20 minutes'),

-- 8. Ibrahim Musa — Kano, BUK, early bird, tidy, male
(uid8, 'Ibrahim Musa', 'https://i.pravatar.cc/150?img=15',
 'Accounting 200L at BUK. Quiet, religious, early riser. Looking for a fellow male student.',
 20, 'male', 'Kano', 'Kano State',
 'BUK', 'Management Sciences', 'Accounting', 2,
 30000, 55000, '2026-09-01',
 ARRAY['religious','studious','homebody'], 'early_bird', 'tidy', 'quiet',
 FALSE, FALSE, FALSE, 'male', FALSE, 'PENDING',
 6, TRUE, TRUE, NOW() - INTERVAL '6 hours'),

-- 9. Chioma Nwachukwu — Abuja, BAZE, night owl, tidy, female
(uid9, 'Chioma Nwachukwu', 'https://i.pravatar.cc/150?img=17',
 'Finance at BAZE University. Loves Afrobeats and baking. Would love a fun, clean female roommate.',
 21, 'female', 'Abuja', 'FCT',
 'BAZE', 'Management', 'Finance', 3,
 65000, 110000, '2026-08-01',
 ARRAY['social','foodie','traveler'], 'night_owl', 'tidy', 'moderate',
 FALSE, FALSE, TRUE, 'female', FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '1 hour'),

-- 10. Segun Olawale — Lagos, UNILAG, flexible, relaxed, male
(uid10, 'Segun Olawale', 'https://i.pravatar.cc/150?img=19',
 'Architecture 400L. Creative type, lots of late-night projects. Pretty chill to live with.',
 23, 'male', 'Lagos', 'Lagos State',
 'UNILAG', 'Environmental Sciences', 'Architecture', 4,
 60000, 100000, '2026-07-01',
 ARRAY['gamer','social','homebody'], 'flexible', 'relaxed', 'moderate',
 FALSE, FALSE, TRUE, NULL, FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '2 hours'),

-- 11. Kemi Adebayo — Ibadan, UI, early bird, very tidy, female
(uid11, 'Kemi Adebayo', 'https://i.pravatar.cc/150?img=21',
 'Biochemistry 200L at UI. Very organised and health-conscious. Vegetarian. Prefer a quiet female roommate.',
 20, 'female', 'Ibadan', 'Oyo State',
 'UI', 'Basic Medical Sciences', 'Biochemistry', 2,
 50000, 85000, '2026-09-01',
 ARRAY['studious','vegetarian','athletic'], 'early_bird', 'very_tidy', 'quiet',
 FALSE, FALSE, FALSE, 'female', FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '4 hours'),

-- 12. Uche Obiechina — Nsukka, UNN, night owl, relaxed, male
(uid12, 'Uche Obiechina', 'https://i.pravatar.cc/150?img=23',
 'Computer Engineering at UNN. Gamer and startup guy. Need someone who gets the hustle.',
 22, 'male', 'Nsukka', 'Enugu State',
 'UNN', 'Engineering', 'Computer Engineering', 4,
 35000, 60000, '2026-08-01',
 ARRAY['gamer','studious','social'], 'night_owl', 'relaxed', 'moderate',
 FALSE, FALSE, TRUE, 'male', FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '3 hours'),

-- 13. Halima Abdullahi — Abuja, UNIABUJA, early bird, tidy, female
(uid13, 'Halima Abdullahi', 'https://i.pravatar.cc/150?img=25',
 'Sociology 300L at UNIABUJA. Soft-spoken and respectful. Looking for a modest, religious female roommate.',
 21, 'female', 'Abuja', 'FCT',
 'UNIABUJA', 'Social Sciences', 'Sociology', 3,
 40000, 70000, '2026-07-01',
 ARRAY['religious','homebody','studious'], 'early_bird', 'tidy', 'very_quiet',
 FALSE, FALSE, FALSE, 'female', FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '7 hours'),

-- 14. David Akintola — Lagos, LASU, flexible, tidy, male
(uid14, 'David Akintola', 'https://i.pravatar.cc/150?img=27',
 'Political Science 200L. Football fan and serious student. Budget-conscious, need affordable place near LASU.',
 20, 'male', 'Lagos', 'Lagos State',
 'LASU', 'Social Sciences', 'Political Science', 2,
 35000, 60000, '2026-09-01',
 ARRAY['athletic','social','studious'], 'flexible', 'tidy', 'moderate',
 FALSE, FALSE, TRUE, 'male', FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '8 hours'),

-- 15. Blessing Onyeka — Enugu, ESUT, flexible, very tidy, female
(uid15, 'Blessing Onyeka', 'https://i.pravatar.cc/150?img=29',
 'Nursing student at ESUT. Compassionate and tidy. Need a clean, peaceful female roommate in Enugu.',
 22, 'female', 'Enugu', 'Enugu State',
 'ESUT', 'Health Sciences', 'Nursing Science', 3,
 45000, 75000, '2026-07-01',
 ARRAY['religious','studious','homebody'], 'early_bird', 'very_tidy', 'quiet',
 FALSE, FALSE, FALSE, 'female', TRUE, 'VERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '30 minutes'),

-- 16. Michael Obi — Port Harcourt, RSU, night owl, relaxed, male
(uid16, 'Michael Obi', 'https://i.pravatar.cc/150?img=31',
 'Petroleum Engineering at RSU. Loves cars, music, and side hustles. Very flexible roommate.',
 23, 'male', 'Port Harcourt', 'Rivers State',
 'RSU', 'Engineering', 'Petroleum Engineering', 4,
 55000, 95000, '2026-08-01',
 ARRAY['social','traveler','gamer'], 'night_owl', 'relaxed', 'lively',
 FALSE, FALSE, TRUE, NULL, FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '1 hour'),

-- 17. Sade Fashola — Lagos, UNILAG, early bird, very tidy, female
(uid17, 'Sade Fashola', 'https://i.pravatar.cc/150?img=33',
 'Economics 400L at UNILAG. Disciplined saver, meal prepper. Love a clean and structured home.',
 23, 'female', 'Lagos', 'Lagos State',
 'UNILAG', 'Social Sciences', 'Economics', 4,
 75000, 130000, '2026-07-01',
 ARRAY['studious','foodie','homebody'], 'early_bird', 'very_tidy', 'quiet',
 FALSE, FALSE, FALSE, 'female', TRUE, 'VERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '15 minutes'),

-- 18. Kenny Okonkwo — Abuja, BAZE, flexible, tidy, male
(uid18, 'Kenny Okonkwo', 'https://i.pravatar.cc/150?img=35',
 'Business 300L at BAZE. Entrepreneur type, always building something. Chill, just need a decent roommate.',
 22, 'male', 'Abuja', 'FCT',
 'BAZE', 'Business', 'Business Administration', 3,
 70000, 120000, '2026-08-01',
 ARRAY['social','gamer','traveler'], 'flexible', 'tidy', 'moderate',
 FALSE, FALSE, TRUE, 'male', FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '2 hours'),

-- 19. Nkechi Okafor — Ibadan, UI, flexible, tidy, female
(uid19, 'Nkechi Okafor', 'https://i.pravatar.cc/150?img=37',
 'English 300L at UI. Bookworm, podcast lover, vegetarian. Looking for a calm and expressive female roommate.',
 21, 'female', 'Ibadan', 'Oyo State',
 'UI', 'Arts', 'English Language', 3,
 50000, 80000, '2026-09-01',
 ARRAY['studious','vegetarian','traveler'], 'flexible', 'tidy', 'quiet',
 FALSE, FALSE, TRUE, 'female', FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '4 hours'),

-- 20. Frank Egwuatu — Enugu, UNN, night owl, messy, male
(uid20, 'Frank Egwuatu', 'https://i.pravatar.cc/150?img=39',
 'Fine Arts 200L. The apartment is my studio. Honest: I am messy but I pay my bills on time.',
 20, 'male', 'Enugu', 'Enugu State',
 'UNN', 'Arts', 'Fine and Applied Arts', 2,
 30000, 55000, '2026-08-01',
 ARRAY['social','athletic','traveler'], 'night_owl', 'messy', 'lively',
 FALSE, FALSE, TRUE, NULL, FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '9 hours'),

-- 21. Yetunde Balogun — Lagos, LASU, early bird, tidy, female
(uid21, 'Yetunde Balogun', 'https://i.pravatar.cc/150?img=41',
 'Accounting 200L at LASU. Focused, ambitious, budget-conscious. Looking for a responsible female roommate.',
 20, 'female', 'Lagos', 'Lagos State',
 'LASU', 'Management Sciences', 'Accounting', 2,
 45000, 70000, '2026-09-01',
 ARRAY['studious','religious','homebody'], 'early_bird', 'tidy', 'quiet',
 FALSE, FALSE, FALSE, 'female', FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '3 hours'),

-- 22. Chuka Anyanwu — Port Harcourt, UNIPORT, flexible, relaxed, male
(uid22, 'Chuka Anyanwu', 'https://i.pravatar.cc/150?img=43',
 'Economics 300L at UNIPORT. Love cooking jollof rice and watching football. Super easy roommate.',
 22, 'male', 'Port Harcourt', 'Rivers State',
 'UNIPORT', 'Social Sciences', 'Economics', 3,
 50000, 85000, '2026-07-01',
 ARRAY['foodie','athletic','social'], 'flexible', 'relaxed', 'moderate',
 FALSE, FALSE, TRUE, 'male', FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '5 hours'),

-- 23. Aisha Garba — Kano, BUK, early bird, very tidy, female
(uid23, 'Aisha Garba', 'https://i.pravatar.cc/150?img=45',
 'Microbiology 100L at BUK. Disciplined, prayerful and organised. Would love a religious female roommate.',
 18, 'female', 'Kano', 'Kano State',
 'BUK', 'Natural Sciences', 'Microbiology', 1,
 25000, 45000, '2026-09-01',
 ARRAY['religious','studious','homebody'], 'early_bird', 'very_tidy', 'very_quiet',
 FALSE, FALSE, FALSE, 'female', FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '10 hours'),

-- 24. Rotimi Adeleke — Abuja, UNIABUJA, night owl, tidy, male
(uid24, 'Rotimi Adeleke', 'https://i.pravatar.cc/150?img=47',
 'Mass Comm 400L at UNIABUJA. Freelance photographer on the side. Laid-back, love good vibes.',
 23, 'male', 'Abuja', 'FCT',
 'UNIABUJA', 'Arts and Humanities', 'Mass Communication', 4,
 60000, 100000, '2026-08-01',
 ARRAY['social','traveler','gamer'], 'night_owl', 'tidy', 'moderate',
 FALSE, FALSE, TRUE, NULL, FALSE, 'UNVERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '2 hours'),

-- 25. Obiageli Nwobi — Ibadan, UI, flexible, very tidy, female
(uid25, 'Obiageli Nwobi', 'https://i.pravatar.cc/150?img=49',
 'Veterinary Medicine 500L at UI. Animal lover, very clean and organised. Open to any gender.',
 24, 'female', 'Ibadan', 'Oyo State',
 'UI', 'Veterinary Medicine', 'Veterinary Medicine', 5,
 65000, 110000, '2026-07-01',
 ARRAY['athletic','vegetarian','traveler'], 'flexible', 'very_tidy', 'quiet',
 FALSE, TRUE, TRUE, NULL, TRUE, 'VERIFIED',
 6, TRUE, TRUE, NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO UPDATE SET
  display_name        = EXCLUDED.display_name,
  avatar_url          = EXCLUDED.avatar_url,
  bio                 = EXCLUDED.bio,
  age                 = EXCLUDED.age,
  gender              = EXCLUDED.gender,
  city                = EXCLUDED.city,
  state               = EXCLUDED.state,
  university          = EXCLUDED.university,
  faculty             = EXCLUDED.faculty,
  course              = EXCLUDED.course,
  year_of_study       = EXCLUDED.year_of_study,
  min_budget          = EXCLUDED.min_budget,
  max_budget          = EXCLUDED.max_budget,
  move_in_date        = EXCLUDED.move_in_date,
  lifestyle_tags      = EXCLUDED.lifestyle_tags,
  sleep_schedule      = EXCLUDED.sleep_schedule,
  cleanliness         = EXCLUDED.cleanliness,
  noise_pref          = EXCLUDED.noise_pref,
  allows_smoking      = EXCLUDED.allows_smoking,
  allows_pets         = EXCLUDED.allows_pets,
  allows_guests       = EXCLUDED.allows_guests,
  roommate_gender_pref = EXCLUDED.roommate_gender_pref,
  student_verified    = EXCLUDED.student_verified,
  verification_status = EXCLUDED.verification_status,
  onboarding_step     = EXCLUDED.onboarding_step,
  onboarding_complete = EXCLUDED.onboarding_complete,
  is_active           = EXCLUDED.is_active,
  last_seen_at        = EXCLUDED.last_seen_at;

-- ── 3 ACTIVE connections for testing chat/splits ──────────────────────────────
INSERT INTO public.connections (requester_id, receiver_id, status, amount_paid, paid_at, connected_at)
VALUES
  (uid1, uid3, 'ACTIVE', 200000, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (uid2, uid10, 'ACTIVE', 200000, NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day'),
  (uid5, uid11, 'ACTIVE', 200000, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

END $$;

-- Ensure directly-seeded Auth users have the metadata/identity rows that GoTrue expects.
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
  jsonb_build_object('sub', users.id::text, 'email', users.email, 'email_verified', true, 'phone_verified', false),
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

-- ─── Sample Feed Posts ────────────────────────────────────────────────────────
INSERT INTO public.posts (id, user_id, content, city, budget_min, budget_max, move_in_date, likes_count, comments_count, created_at, updated_at)
VALUES
  ('c0000000-0001-0001-0001-000000000001', '11111111-0001-0001-0001-000000000001', 'Looking for a flatmate to share a 2-bedroom apartment in Yaba, close to UNILAG. Budget is around 100k.', 'Lagos', 80000, 120000, '2026-07-15', 5, 2, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('c0000000-0002-0002-0002-000000000002', '11111111-0002-0002-0002-000000000002', 'Anyone looking for a roommate in Abuja? Moving near UNIABUJA main campus by August. HMU!', 'Abuja', 50000, 80000, '2026-08-01', 3, 0, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),
  ('c0000000-0003-0003-0003-000000000003', '11111111-0003-0003-0003-000000000003', 'Pharmacy student searching for a quiet room or shared apartment in Yaba. I am super tidy and quiet.', 'Lagos', 60000, 100000, '2026-07-01', 2, 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('c0000000-0004-0004-0004-000000000004', '11111111-0004-0004-0004-000000000004', 'Looking for roommates to rent a house together in Enugu near UNN. Already found a nice 3-bedroom place.', 'Enugu', 40000, 70000, '2026-09-01', 0, 0, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Ensure all auth.users have the default instance_id set (required by GoTrue auth)
UPDATE auth.users
SET instance_id = '00000000-0000-0000-0000-000000000000'
WHERE instance_id IS NULL;


