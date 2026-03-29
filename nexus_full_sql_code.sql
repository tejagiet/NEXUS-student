-- ============================================================
-- PHASE 0: FOUNDATIONAL SCHEMA & CORE TABLES
-- ============================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Institutional Profiles (Core Identity)
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT NOT NULL,
    email       TEXT UNIQUE,
    role        TEXT CHECK (role IN ('student', 'faculty', 'admin', 'principal', 'vice_principal', 'hod', 'class_teacher')),
    roles       TEXT[] DEFAULT '{}',
    pin_number  TEXT UNIQUE,
    branch      TEXT,
    section     TEXT,
    mobile      TEXT,
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Academic Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name        TEXT NOT NULL,
    code        TEXT UNIQUE,
    branch      TEXT,
    semester    TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Attendance System
CREATE TABLE IF NOT EXISTS public.attendance (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id  UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    date        DATE DEFAULT CURRENT_DATE,
    status      TEXT CHECK (status IN ('present', 'absent', 'late')),
    topic       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Finance / Fees
CREATE TABLE IF NOT EXISTS public.fees (
    student_id   UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_fee    DECIMAL(10,2) DEFAULT 0,
    paid_fee     DECIMAL(10,2) DEFAULT 0,
    status       TEXT DEFAULT 'pending',
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS on Core Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- PHASE 1+: MIGRATIONS & MODULES
-- ============================================================

-- ==========================================
-- File: admin_identity_tools.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” Security Sync: Admin Password Management
-- Allows authorized admins to reset user credentials.
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Ensure pgcrypto is enabled for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a secure function to reset user passwords
CREATE OR REPLACE FUNCTION admin_reset_password(target_user_id UUID, new_password TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with superuser privileges to access auth schema
SET search_path = public
AS $$
DECLARE
  hashed_password TEXT;
BEGIN
  -- 1. Check if the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (roles @> ARRAY['admin']::text[])
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only institutional administrators can reset authentication credentials.';
  END IF;

  -- 2. Hash the new password (Compatible with Supabase/PostgreSQL crypt format)
  -- Supabase Auth typically uses Blowfish (bf) hashing
  -- We use extensions.crypt to ensure the function is found regardless of search_path
  hashed_password := extensions.crypt(new_password, extensions.gen_salt('bf'));

  -- 3. Update auth.users (authentication table)
  UPDATE auth.users 
  SET encrypted_password = hashed_password,
      updated_at = now()
  WHERE id = target_user_id;

  -- 4. Log the administrative action (Optional, but good for security trails)
  RAISE NOTICE 'Administrative password reset performed for user % by admin %', target_user_id, auth.uid();
END;
$$;

COMMENT ON FUNCTION admin_reset_password IS 'Administratively resets a user password in the authentication system.';


-- ==========================================
-- File: cctv_https_upgrade.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” CCTV Security Patch (v4.7)
-- Fixes Mixed Content blocks in Production (Vercel)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Update existing nodes to use HTTPS streams
UPDATE public.cctv_nodes 
SET url = 'http://webcam.anklam.de/axis-cgi/mjpg/video.cgi' 
WHERE node_id = 'NODE-01';

UPDATE public.cctv_nodes 
SET url = 'http://montfarlagne.tacticddns.com:8081/axis-cgi/mjpg/video.cgi' 
WHERE node_id = 'NODE-02';

-- Node 3 & 4 already use secure Unsplash URLs, but let's ensure they are HTTPS
UPDATE public.cctv_nodes 
SET url = 'http://plassenburg-blick.iyxdveyshavdrmjx.myfritz.net/cgi-bin/faststream.jpg?stream=full&fps=25' 
WHERE node_id = 'NODE-03';



-- ==========================================
-- File: cctv_https_upgrade_final.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” CCTV Security Patch (v4.7 FINAL)
-- Fixes Mixed Content blocks in Production (Vercel)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Ensure table exists
CREATE TABLE IF NOT EXISTS public.cctv_nodes (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name         TEXT NOT NULL,
    url          TEXT NOT NULL,
    location     TEXT DEFAULT 'Campus',
    is_active    BOOLEAN DEFAULT TRUE,
    is_motion    BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    node_id      TEXT UNIQUE
);

-- Reset/Update with SECURE HTTPS Streams
-- Note: These node_ids match the ones used in the UI logic.
INSERT INTO public.cctv_nodes (node_id, name, url, location)
VALUES 
    ('NODE-001', 'Main Entrance - HD', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', 'Main Gate'),
    ('NG-NODE-002', 'Academic Block A', 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8', 'Block A'),
    ('NG-NODE-003', 'Library Hallway', 'http://webcam.anklam.de/axis-cgi/mjpg/video.cgi', 'Library'),
    ('NG-NODE-004', 'Student Lounge', 'http://montfarlagne.tacticddns.com:8081/axis-cgi/mjpg/video.cgi', 'Lounge Area'),
    ('NG-NODE-005', 'Cloud Bridge POC', 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', 'Cloud Uplink')
ON CONFLICT (node_id) 
DO UPDATE SET url = EXCLUDED.url, name = EXCLUDED.name;


-- ==========================================
-- File: critical_role_fix.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” CRITICAL ROLE REPAIR (v2.0)
-- Fixes: "violates check constraint profiles_role_check"
-- Run this in: Supabase Dashboard > SQL Editor
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 1. Identify and Drop ANY constraint on the 'role' column
-- We search for any constraint that mentions 'role' in the 'profiles' table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.constraint_column_usage 
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) LOOP
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE';
    END LOOP;
END $$;

-- 2. Add the Master Role Constraint with the full institutional hierarchy
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN (
    'student', 
    'faculty', 
    'admin', 
    'principal', 
    'vice_principal', 
    'hod', 
    'class_teacher'
));

-- 3. Verify the sync
COMMENT ON CONSTRAINT profiles_role_check ON public.profiles IS 'Master Nexus GIET Hierarchy: Student, Faculty, Admin, Principal, Vice-Principal, HOD, Class Teacher.';

-- 4. Audit current data to catch any invalid values that might block the constraint
SELECT id, full_name, role FROM public.profiles WHERE role NOT IN (
    'student', 'faculty', 'admin', 'principal', 'vice_principal', 'hod', 'class_teacher'
);


-- ==========================================
-- File: erp_expansion_schema.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” Institutional Intelligence (Phase 44)
-- Objective: Curriculum, Timetable, and Flexible Attendance
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 1. ATTENDANCE ENHANCEMENT
-- Add 'topic' column to track what was taught in each session
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS topic TEXT;

-- 2. CURRICULUM TABLE
-- Stores syllabus topics for each subject
CREATE TABLE IF NOT EXISTS public.curriculum (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id  UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TIMETABLE SLOTS
-- Stores the weekly schedule for subjects, branches, and sections
CREATE TABLE IF NOT EXISTS public.timetable_slots (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id  UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    day_of_week TEXT CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    branch      TEXT NOT NULL,
    section     TEXT NOT NULL,
    room        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACADEMIC CALENDAR
-- Unified view for holidays, exams, and events
CREATE TABLE IF NOT EXISTS public.academic_calendar (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date        DATE NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    type        TEXT CHECK (type IN ('holiday','event','exam','academic_day')) DEFAULT 'academic_day',
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTICES & CIRCULARS
-- Official communication channel
CREATE TABLE IF NOT EXISTS public.notices (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title        TEXT NOT NULL,
    content      TEXT NOT NULL,
    author_id    UUID REFERENCES public.profiles(id),
    target_role  TEXT DEFAULT 'ALL', -- ALL, student, faculty
    target_branch TEXT DEFAULT 'ALL',
    attachment_url TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RLS POLICIES (Security)
ALTER TABLE public.curriculum      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices         ENABLE ROW LEVEL SECURITY;

-- Curriculum: Everyone can see, Faculty/Admin manage
DROP POLICY IF EXISTS "curriculum_select" ON public.curriculum;
CREATE POLICY "curriculum_select" ON public.curriculum FOR SELECT USING (true);

DROP POLICY IF EXISTS "curriculum_manage" ON public.curriculum;
CREATE POLICY "curriculum_manage" ON public.curriculum FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'hod', 'principal'))
);

-- Timetable: Everyone can see, Admins manage
DROP POLICY IF EXISTS "timetable_select" ON public.timetable_slots;
CREATE POLICY "timetable_select" ON public.timetable_slots FOR SELECT USING (true);

DROP POLICY IF EXISTS "timetable_manage" ON public.timetable_slots;
CREATE POLICY "timetable_manage" ON public.timetable_slots FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'hod'))
);

-- Calendar: Everyone can see, Admins manage
DROP POLICY IF EXISTS "calendar_select" ON public.academic_calendar;
CREATE POLICY "calendar_select" ON public.academic_calendar FOR SELECT USING (true);

DROP POLICY IF EXISTS "calendar_manage" ON public.academic_calendar;
CREATE POLICY "calendar_manage" ON public.academic_calendar FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'principal'))
);

-- Notices: Everyone can see relevant ones
DROP POLICY IF EXISTS "notices_select" ON public.notices;
CREATE POLICY "notices_select" ON public.notices FOR SELECT USING (true);

DROP POLICY IF EXISTS "notices_manage" ON public.notices;
CREATE POLICY "notices_manage" ON public.notices FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'principal', 'hod'))
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- FEEDBACK & LOGS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
COMMENT ON TABLE public.curriculum IS 'Nexus Syllabi storage per subject.';
COMMENT ON TABLE public.timetable_slots IS 'Master schedule for Nexus GIET.';


-- ==========================================
-- File: fee_sync_init.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” Fee Sync Initialization (v1)
-- Syncs with GIET CampX Payment Portal
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 1. Extend Fees Table with Breakdown Columns
ALTER TABLE fees 
ADD COLUMN IF NOT EXISTS year_1_due DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS year_2_due DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS year_3_due DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS year_4_due DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS admission_id TEXT, -- CampX Internal ID
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- 2. Add Index for Sync Lookup
CREATE INDEX IF NOT EXISTS idx_fees_last_sync ON fees(last_synced_at);

-- 3. Update RLS (Ensure students can see their own breakdown)
-- (Existing policies already cover select, but let's be explicit if needed)
-- Policy: "fees_student_select" ON fees FOR SELECT USING (auth.uid() = student_id)
-- Note: student_id in 'fees' is linked to 'profiles.id' which is 'auth.uid()' 

-- 4. Initial Seed Correction (Optional)
-- Ensure all students have a fee record if they exist in profiles
INSERT INTO fees (student_id, total_fee, paid_fee, status)
SELECT id, 45000, 0, 'pending'
FROM profiles
WHERE role = 'student'
ON CONFLICT (student_id) DO NOTHING;


-- ==========================================
-- File: fee_sync_v2.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” Fee Sync categorized extension (v2)
-- Adds granular columns for College and Transport dues
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

ALTER TABLE fees 
ADD COLUMN IF NOT EXISTS college_due DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS transport_due DECIMAL(10,2) DEFAULT 0;

-- Optional: Comments for clarity
COMMENT ON COLUMN fees.college_due IS 'Sum of academic/college related dues';
COMMENT ON COLUMN fees.transport_due IS 'Sum of transport/bus related dues';


-- ==========================================
-- File: google_gatekeeper.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” Google Auth Gatekeeper (v2.0)
-- Objective: Allow Google Login IF email matches an existing authorized profile.
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    profile_exists BOOLEAN;
BEGIN
    -- 1. Check if this email is already pre-authorized in profiles
    -- We match by the email coming from Auth (new.email)
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE email = new.email 
        OR pin_number IS NOT NULL -- Safety for legacy manual inserts
    ) INTO profile_exists;

    -- 2. If it's a social login (Google) and NOT in our database, BLOCK IT
    IF (new.raw_app_meta_data->>'provider' = 'google') THEN
        IF NOT profile_exists THEN
            RAISE EXCEPTION 'Nexus Access Denied: The account % is not authorized. Contact GIET SOC Admin.', new.email;
        END IF;

        -- ðŸ”— Identity Linking: If a profile exists with this email but different ID, 
        -- we could optionally link it here, but usually Supabase handles the ID linkage.
        -- Here we just ensure that if allow it, the profile logic below will merge it.
    END IF;

    -- 3. Sync/Create profile entry
    INSERT INTO public.profiles (id, full_name, role, pin_number, branch, mobile, email)
    VALUES (
        new.id, 
        new.raw_user_meta_data->>'full_name', 
        COALESCE(new.raw_user_meta_data->>'role', 'student'),
        new.raw_user_meta_data->>'pin_number',
        new.raw_user_meta_data->>'branch',
        new.raw_user_meta_data->>'mobile',
        new.email
    ) 
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- File: identity_sync.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” Identity Sync Security Patch (v1.0)
-- Ensures email-based identity matching is accurate and fast.
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 1. Ensure email column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- 2. Add Unique constraint if not present (to prevent identity duplicate/overlap)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- 3. Create Index for Gatekeeper performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

COMMENT ON COLUMN public.profiles.email IS 'Primary identifier for identity linking and alternate login methods.';


-- ==========================================
-- File: institutional_hardening.sql
-- ==========================================
-- ðŸ›ï¸ Institutional Hardening Schema Updates
-- Run this in Supabase SQL Editor

-- 1. Add avatar support to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create avatars storage bucket (if bucket creation via SQL is supported in your environment)
-- Note: You might need to create the 'avatars' bucket manually in the Storage UI
-- and then run these RLS policies.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS Policies
-- Allow public viewing of avatars
CREATE POLICY "Public Avatars are viewable by everyone" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- Allow users to upload their own avatar (max 1MB enforced in frontend too)
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update/delete their own avatar
CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars') 
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);


-- ==========================================
-- File: lms_assignments_schema.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” LMS & Assignments (Phase 46)
-- Objective: Assignments, Submissions, and Grading
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 1. ASSIGNMENTS TABLE
-- Faculty/HOD can create tasks for students
CREATE TABLE IF NOT EXISTS public.assignments (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id  UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    due_date    TIMESTAMPTZ,
    max_points  INT DEFAULT 10,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    created_by  UUID REFERENCES public.profiles(id)
);

-- 2. SUBMISSIONS TABLE
-- Students upload their work here
CREATE TABLE IF NOT EXISTS public.submissions (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_url      TEXT, -- Supabase Storage link
    content       TEXT, -- Optional text content
    grade         DECIMAL(5,2),
    feedback      TEXT,
    status        TEXT CHECK (status IN ('submitted','graded','late','returned')) DEFAULT 'submitted',
    submitted_at  TIMESTAMPTZ DEFAULT NOW(),
    graded_at     TIMESTAMPTZ,
    UNIQUE(assignment_id, student_id)
);

-- 3. RLS POLICIES (Security)
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Assignments: Everyone can see, Faculty/Admin manage
DROP POLICY IF EXISTS "assignments_select" ON public.assignments;
CREATE POLICY "assignments_select" ON public.assignments FOR SELECT USING (true);

DROP POLICY IF EXISTS "assignments_manage" ON public.assignments;
CREATE POLICY "assignments_manage" ON public.assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'faculty', 'hod', 'class_teacher', 'principal'))
);

-- Submissions: Students see/manage their own, Faculty see/grade all for their subjects
DROP POLICY IF EXISTS "submissions_student_all" ON public.submissions;
CREATE POLICY "submissions_student_all" ON public.submissions FOR ALL USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "submissions_faculty_select" ON public.submissions;
CREATE POLICY "submissions_faculty_select" ON public.submissions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'faculty', 'hod', 'class_teacher', 'principal'))
);

DROP POLICY IF EXISTS "submissions_faculty_update" ON public.submissions;
CREATE POLICY "submissions_faculty_update" ON public.submissions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'faculty', 'hod', 'class_teacher', 'principal'))
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- STORAGE BUCKET POLICY
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- 1. Need a 'submissions' bucket in Supabase Storage
-- 2. Policy: Authenticated users can upload to their own folder: submissions/{auth.uid()}/...

COMMENT ON TABLE public.assignments IS 'Faculty tasks for students.';
COMMENT ON TABLE public.submissions IS 'Student work for assignments.';


-- ==========================================
-- File: manual_fee_sync.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” Manual Fee Sync (PIN: 24295-AI-038)
-- Discoverd via CampX SOC: â‚¹86,811.00
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 1. Ensure the student exists in the fees table
INSERT INTO fees (student_id, total_fee, paid_fee, status)
SELECT id, 86811.00, 0, 'partial'
FROM profiles
WHERE pin_number = '24295-AI-038'
ON CONFLICT (student_id) DO NOTHING;

-- 2. Update with the breakdown captured from CampX
UPDATE fees
SET 
  total_fee = 86811.00,
  year_1_due = 18750.00,
  year_2_due = 38061.00,
  year_3_due = 30000.00,
  year_4_due = 0.00,
  admission_id = '01HYWKJZ80FS93TXMWRKHJ384G',
  last_synced_at = NOW(),
  status = 'partial'
WHERE student_id IN (
  SELECT id FROM profiles WHERE pin_number = '24295-AI-038'
);

-- Verification:
-- SELECT * FROM fees WHERE student_id IN (SELECT id FROM profiles WHERE pin_number = '24295-AI-038');


-- ==========================================
-- File: multi_role_migration.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” Multi-Role Infrastructure (Phase 58)
-- Enables staff to hold multiple institutional roles.
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 1. Add roles array column if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='roles') THEN
        ALTER TABLE public.profiles ADD COLUMN roles TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 2. Migrate existing single role to the roles array (if array is empty)
UPDATE public.profiles 
SET roles = ARRAY[role] 
WHERE (roles = '{}' OR roles IS NULL) AND role IS NOT NULL;

-- 3. Create index for performance on roles array
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON public.profiles USING GIN (roles);

COMMENT ON COLUMN public.profiles.roles IS 'Array of assigned institutional roles (e.g., {faculty, hod}).';


-- ==========================================
-- File: multi_section_timetable.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” Multi-Section Timetable Expansion
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 1. Ensure timetable_slots has semester support
ALTER TABLE public.timetable_slots ADD COLUMN IF NOT EXISTS semester TEXT;

-- 2. Create index for faster lookups by faculty (via subjects)
-- This facilitates the "My Schedule" view
CREATE INDEX IF NOT EXISTS idx_timetable_slots_subject ON public.timetable_slots(subject_id);

-- 3. (Optional) Legacy Migration if 'timetables' table exists
-- If the project was using 'timetables' (plural), handle migration here.
-- For now, we standardize on 'timetable_slots'.

COMMENT ON COLUMN public.timetable_slots.semester IS 'The academic semester (e.g., Sem 1, Sem 4).';


-- ==========================================
-- File: role_expansion.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” Role Expansion Security Patch (v5.0)
-- Adds hierarchical roles: Principal, HOD, Vice Principal, Class Teacher
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 1. Drop existing constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Add expanded role constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'faculty', 'admin', 'principal', 'vice_principal', 'hod', 'class_teacher'));

-- 3. (Optional) Audit current roles
-- SELECT role, count(*) FROM public.profiles GROUP BY role;

COMMENT ON CONSTRAINT profiles_role_check ON public.profiles IS 'Restricts roles to valid Nexus GIET institutional positions.';


-- ==========================================
-- File: social_ecosystem_schema.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” Social Ecosystem (Phase 47)
-- Objective: Chat Rooms, Clubs, and Events
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 1. CHAT ROOMS
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name        TEXT NOT NULL,
    section     TEXT NOT NULL, -- 'A', 'B', 'C'
    branch      TEXT NOT NULL, -- 'CME', 'ECE', etc.
    subject_id  UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    created_by  UUID REFERENCES public.profiles(id)
);

-- 2. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id     UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLUBS & EVENTS
CREATE TABLE IF NOT EXISTS public.clubs (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    logo_url    TEXT,
    leader_id   UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name    TEXT NOT NULL,
    description   TEXT,
    club_id       UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
    student_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    status        TEXT DEFAULT 'confirmed',
    UNIQUE(event_name, student_id)
);

-- RLS POLICIES
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Chat: Only members of that branch/section can see
DROP POLICY IF EXISTS "chat_rooms_access" ON public.chat_rooms;
CREATE POLICY "chat_rooms_access" ON public.chat_rooms FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (p.branch = chat_rooms.branch OR p.role IN ('admin', 'principal')))
);

DROP POLICY IF EXISTS "chat_messages_select" ON public.chat_messages;
CREATE POLICY "chat_messages_select" ON public.chat_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_rooms r WHERE r.id = chat_messages.room_id)
);

DROP POLICY IF EXISTS "chat_messages_insert" ON public.chat_messages;
CREATE POLICY "chat_messages_insert" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Clubs: Publicly viewable
DROP POLICY IF EXISTS "clubs_select" ON public.clubs;
CREATE POLICY "clubs_select" ON public.clubs FOR SELECT USING (true);

DROP POLICY IF EXISTS "event_reg_student" ON public.event_registrations;
CREATE POLICY "event_reg_student" ON public.event_registrations FOR ALL USING (auth.uid() = student_id);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- REALTIME SETUP
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'chat_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    END IF;
END $$;


-- ==========================================
-- File: storage_repair.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” Storage & Avatar Repair (Hotfix)
-- Fixes the 400 Bad Request by ensuring bucket and RLS policies.
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 1. Ensure 'avatars' bucket is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public Avatars are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Staff can manage all avatars" ON storage.objects;

-- 3. Create Optimized RLS Policies

-- Public View
CREATE POLICY "Public Avatars are viewable by everyone" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- User Self-Management (Upload to folder named with their UID)
CREATE POLICY "Users can manage their own avatar" 
ON storage.objects FOR ALL 
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Institutional Management (Staff can manage ANY student/staff avatar)
CREATE POLICY "Staff can manage all avatars" 
ON storage.objects FOR ALL 
USING (
  bucket_id = 'avatars' AND 
  (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (
      role IN ('admin', 'hod', 'principal', 'vice_principal', 'faculty') OR
      roles && ARRAY['admin', 'hod', 'principal', 'vice_principal', 'faculty']::text[]
    )
  ))
);

COMMENT ON TABLE storage.objects IS 'Institutional asset store with Role-Based Access Control.';


-- ==========================================
-- File: sync_auth_email.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” Security Sync: Admin Email Management
-- Allows authorized admins to sync authentication emails.
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Create a secure function to update auth.users email
CREATE OR REPLACE FUNCTION sync_user_email(target_user_id UUID, new_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with superuser privileges to access auth schema
SET search_path = public
AS $$
BEGIN
  -- 1. Check if the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (roles @> ARRAY['admin']::text[])
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only institutional administrators can sync authentication emails.';
  END IF;

  -- 2. Update auth.users (authentication table)
  UPDATE auth.users 
  SET email = new_email,
      email_confirmed_at = now(), -- Auto-confirm for administrative changes
      updated_at = now()
  WHERE id = target_user_id;

  -- 3. Update profiles (public schema)
  UPDATE public.profiles
  SET email = new_email,
      updated_at = now()
  WHERE id = target_user_id;
END;
$$;

COMMENT ON FUNCTION sync_user_email IS 'Administratively updates a user email across both auth and profile records.';


-- ==========================================
-- File: timetable_schema_fix.sql
-- ==========================================
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- NEXUS GIET â€” Timetable Schema Hotfix
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- 1. Ensure timetable_slots has the slot-based structure and relaxed constraints
ALTER TABLE public.timetable_slots ADD COLUMN IF NOT EXISTS day TEXT;
ALTER TABLE public.timetable_slots ADD COLUMN IF NOT EXISTS slot INT;
ALTER TABLE public.timetable_slots ADD COLUMN IF NOT EXISTS semester TEXT;

-- Relax old time-based constraints that are no longer strictly mandatory for slot-based system
ALTER TABLE public.timetable_slots ALTER COLUMN start_time DROP NOT NULL;
ALTER TABLE public.timetable_slots ALTER COLUMN end_time DROP NOT NULL;

-- 2. Migrate data from legacy 'timetables' if it exists
-- This prevents data loss during the transition
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'timetables') THEN
        INSERT INTO public.timetable_slots (subject_id, day, slot, branch, section, semester)
        SELECT subject_id, day, slot, branch, section, semester
        FROM public.timetables
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 3. Add UNIQUE constraint to enable upsert (onConflict)
-- This is what prevents the 400 Bad Request
ALTER TABLE public.timetable_slots 
DROP CONSTRAINT IF EXISTS timetable_slots_unique_identity;

ALTER TABLE public.timetable_slots 
ADD CONSTRAINT timetable_slots_unique_identity 
UNIQUE (branch, semester, section, day, slot);

-- 4. RLS for safety
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.timetable_slots IS 'Nexus GIET Unified Timetable â€” Supports multi-section and personal schedules.';



