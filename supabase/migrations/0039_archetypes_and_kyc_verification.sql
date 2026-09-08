-- Migration 0039: Archetypes and KYC Verification
-- Supports 3 user archetypes (student, nysc_corper, young_professional) and identity verification (NIN, Face Liveness, Documents)

-- 1. Extend profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('student','nysc_corper','young_professional')) DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state_of_origin TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lga_of_origin TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS religion TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_range TEXT DEFAULT NULL;

-- NIN verification fields (NDPR compliant - no raw NIN)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nin_hash TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nin_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nin_verified_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nin_vendor_ref TEXT DEFAULT NULL;

-- Facial recognition fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS face_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS face_verified_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS face_vendor_ref TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS face_match_score FLOAT DEFAULT NULL;

-- Identity composite flag
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS identity_verified_at TIMESTAMPTZ DEFAULT NULL;

-- Legacy flag for existing users
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_legacy_user BOOLEAN DEFAULT FALSE;

-- Index profiles for fast query lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_nin_hash ON profiles(nin_hash) WHERE nin_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_identity_verified ON profiles(identity_verified);

-- 2. Create verification_sessions table
CREATE TABLE IF NOT EXISTS verification_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('nin_lookup','face_match','liveness','document_upload')),
  vendor TEXT NOT NULL DEFAULT 'dojah',
  vendor_ref TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','passed','failed','error','manual_review')),
  payload JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_verification_sessions_user_id ON verification_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_sessions_status ON verification_sessions(status);

-- RLS for verification_sessions
ALTER TABLE verification_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification sessions"
  ON verification_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification sessions"
  ON verification_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Create student_verifications table
CREATE TABLE IF NOT EXISTS student_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  study_status TEXT CHECK (study_status IN ('undergraduate','postgraduate','diploma','hnd','other')),
  institution_name TEXT,
  institution_state TEXT,
  reg_number TEXT,
  reg_number_format_matched BOOLEAN DEFAULT FALSE,
  document_type TEXT CHECK (document_type IN ('id_card','admission_letter','student_record','other')),
  document_url TEXT,
  document_status TEXT DEFAULT 'pending' CHECK (document_status IN ('pending','approved','rejected')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE student_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own student verification"
  ON student_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update own student verification"
  ON student_verifications FOR ALL
  USING (auth.uid() = user_id);

-- 4. Create nysc_verifications table
CREATE TABLE IF NOT EXISTS nysc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  call_up_number TEXT,
  batch_year TEXT,
  state_of_posting TEXT,
  cds_group TEXT,
  cds_location TEXT,
  nysc_id_url TEXT,
  call_up_letter_url TEXT,
  document_status TEXT DEFAULT 'pending' CHECK (document_status IN ('pending','approved','rejected')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE nysc_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nysc verification"
  ON nysc_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update own nysc verification"
  ON nysc_verifications FOR ALL
  USING (auth.uid() = user_id);

-- 5. Create professional_verifications table
CREATE TABLE IF NOT EXISTS professional_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  occupation TEXT,
  employer_name TEXT,
  employment_type TEXT CHECK (employment_type IN ('employed','freelancer','contractor','other')),
  utility_bill_url TEXT,
  proof_of_occupation_url TEXT,
  proof_type TEXT CHECK (proof_type IN ('employer_letter','payslip','freelance_receipt','linkedin_url','other')),
  proof_note TEXT,
  document_status TEXT DEFAULT 'pending' CHECK (document_status IN ('pending','approved','rejected')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE professional_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own professional verification"
  ON professional_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update own professional verification"
  ON professional_verifications FOR ALL
  USING (auth.uid() = user_id);

-- 6. Backfill pre-existing legacy users
UPDATE profiles
SET
  is_legacy_user = TRUE,
  user_type = COALESCE(user_type, 'student')
WHERE created_at < now();
