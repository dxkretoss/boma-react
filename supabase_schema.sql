-- BOMA matching pool onboarding database schema
-- Paste this script into the Supabase SQL Editor to initialize all tables, seed data, and setup RLS rules.

-- 1. Extend the users table with the required BOMA fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS entry_path text CHECK (entry_path IN ('MATCHING_POOL', 'EXISTING_POD'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'NOT_STARTED' CHECK (onboarding_status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_status text DEFAULT 'INCOMPLETE' CHECK (profile_status IN ('INCOMPLETE', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS readiness_status text DEFAULT 'NOT_CALCULATED' CHECK (readiness_status IN ('NOT_CALCULATED', 'CALCULATED'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS matching_status text DEFAULT 'NOT_ELIGIBLE' CHECK (matching_status IN ('NOT_ELIGIBLE', 'ELIGIBLE', 'IN_POOL', 'MATCHED', 'POD_ASSIGNED'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 2. Create onboarding_questionnaires table
CREATE TABLE IF NOT EXISTS public.onboarding_questionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  version integer DEFAULT 1 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  published_at timestamp with time zone,
  created_by uuid REFERENCES public.users(id)
);

-- 3. Create onboarding_questions table
CREATE TABLE IF NOT EXISTS public.onboarding_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id uuid REFERENCES public.onboarding_questionnaires(id) ON DELETE CASCADE,
  question_key text NOT NULL,
  step_number integer NOT NULL,
  title text NOT NULL,
  description text,
  question_type text CHECK (question_type IN ('single_choice', 'multiple_choice', 'text', 'number', 'select', 'range', 'boolean')),
  is_required boolean DEFAULT true NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  display_order integer NOT NULL,
  scoring_enabled boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Create onboarding_question_options table
CREATE TABLE IF NOT EXISTS public.onboarding_question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES public.onboarding_questions(id) ON DELETE CASCADE,
  option_key text NOT NULL,
  label text NOT NULL,
  description text,
  value text,
  display_order integer NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. Create onboarding_responses table
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  questionnaire_id uuid REFERENCES public.onboarding_questionnaires(id),
  questionnaire_version integer NOT NULL,
  question_id uuid REFERENCES public.onboarding_questions(id),
  question_key text NOT NULL,
  answer_json jsonb NOT NULL,
  answered_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, question_id)
);

-- 6. Create onboarding_progress table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  questionnaire_id uuid REFERENCES public.onboarding_questionnaires(id),
  current_step integer DEFAULT 1 NOT NULL,
  total_steps integer DEFAULT 9 NOT NULL,
  status text DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
  started_at timestamp with time zone DEFAULT now() NOT NULL,
  last_saved_at timestamp with time zone DEFAULT now() NOT NULL,
  completed_at timestamp with time zone
);

-- 7. Create readiness_scoring_rules table
CREATE TABLE IF NOT EXISTS public.readiness_scoring_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES public.onboarding_questions(id) ON DELETE CASCADE,
  option_id uuid REFERENCES public.onboarding_question_options(id) ON DELETE CASCADE,
  score_value integer NOT NULL,
  rule_type text DEFAULT 'option_value',
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 8. Create profile_reviews table
CREATE TABLE IF NOT EXISTS public.profile_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES public.users(id),
  action text CHECK (action IN ('APPROVE', 'REJECT', 'FLAG')),
  reason text,
  previous_status text,
  new_status text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 9. Create matching_pool_entries table
CREATE TABLE IF NOT EXISTS public.matching_pool_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  status text DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'MATCHED', 'REMOVED')),
  entered_at timestamp with time zone DEFAULT now() NOT NULL,
  readiness_score integer NOT NULL,
  entry_path text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 10. Create matching_weights table
CREATE TABLE IF NOT EXISTS public.matching_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variable_key text NOT NULL UNIQUE,
  weight integer NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  updated_by uuid REFERENCES public.users(id),
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Disable Row Level Security (RLS) on all tables to align with BOMA's custom table auth
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_questionnaires DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_question_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_scoring_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_pool_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_weights DISABLE ROW LEVEL SECURITY;

-- 12. Seed default BOMA Onboarding Questionnaire, Questions, and Options
DO $$
DECLARE
  q_id uuid;
  q1_id uuid;
  q2_id uuid;
  q3_a_id uuid;
  q3_b_id uuid;
  q4_a_id uuid;
  q4_b_id uuid;
  q4_c_id uuid;
  q5_a_id uuid;
  q5_b_id uuid;
  q5_c_id uuid;
  q6_id uuid;
  q7_id uuid;
  
  opt_q1_1 uuid; opt_q1_2 uuid; opt_q1_3 uuid;
  opt_q3_1 uuid; opt_q3_2 uuid; opt_q3_3 uuid;
  opt_q3_b1 uuid; opt_q3_b2 uuid; opt_q3_b3 uuid;
  opt_q4_c1 uuid; opt_q4_c2 uuid; opt_q4_c3 uuid;
  opt_q5_b1 uuid; opt_q5_b2 uuid; opt_q5_b3 uuid; opt_q5_b4 uuid;
  opt_q5_c1 uuid; opt_q5_c2 uuid; opt_q5_c3 uuid; opt_q5_c4 uuid;
  opt_q6_1 uuid; opt_q6_2 uuid; opt_q6_3 uuid; opt_q6_4 uuid;
  opt_q7_1 uuid; opt_q7_2 uuid; opt_q7_3 uuid;
BEGIN
  -- Insert Questionnaire
  INSERT INTO public.onboarding_questionnaires (name, description, status, version, published_at)
  VALUES ('BOMA Matching Pool Onboarding', 'The primary matching pool questionnaire focusing on lifestyle, values, location bounds, and financial metrics.', 'PUBLISHED', 1, now())
  RETURNING id INTO q_id;

  -- STEP 1: Age Group
  INSERT INTO public.onboarding_questions (questionnaire_id, question_key, step_number, title, description, question_type, display_order)
  VALUES (q_id, 'age_group', 1, 'Select your age group', 'BOMA adapts its communication style and question examples to align with your generation''s life stage, while keeping scoring identical.', 'single_choice', 1)
  RETURNING id INTO q1_id;



  INSERT INTO public.onboarding_question_options (question_id, option_key, label, description, display_order) VALUES
  (q1_id, 'age_18_30', '18–30 years', 'Gen Z / Millennials • Nomads, Professionals & Creators', 1) RETURNING id INTO opt_q1_1;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, description, display_order) VALUES
  (q1_id, 'age_31_60', '31–60 years', 'Gen X / Millennials • Families, Builders & Professionals', 2) RETURNING id INTO opt_q1_2;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, description, display_order) VALUES
  (q1_id, 'age_61+', '61+ years', 'Boomers / Seniors • Active Retirement & Community Elders', 3) RETURNING id INTO opt_q1_3;

  -- STEP 2: Lifestyle
  INSERT INTO public.onboarding_questions (questionnaire_id, question_key, step_number, title, description, question_type, display_order)
  VALUES (q_id, 'lifestyles', 2, 'What matters most to you day to day?', 'Select the options that best match your core lifestyle values.', 'multiple_choice', 2)
  RETURNING id INTO q2_id;

  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q2_id, 'quiet', 'Quiet & low-key', 1),
  (q2_id, 'sustainability', 'Sustainability', 2),
  (q2_id, 'social', 'Social & communal meals', 3),
  (q2_id, 'pet', 'Pet-friendly', 4),
  (q2_id, 'remote', 'Remote-work friendly', 5),
  (q2_id, 'family', 'Family-oriented', 6);

  -- STEP 3: Community Preference
  INSERT INTO public.onboarding_questions (questionnaire_id, question_key, step_number, title, description, question_type, display_order)
  VALUES (q_id, 'decision_style', 3, 'How do you like to make group decisions?', 'Select your preferred group decision making style.', 'single_choice', 3)
  RETURNING id INTO q3_a_id;

  INSERT INTO public.onboarding_question_options (question_id, option_key, label, description, display_order) VALUES
  (q3_a_id, 'consensus', 'Consensus', 'Everyone weighs in', 1) RETURNING id INTO opt_q3_1;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, description, display_order) VALUES
  (q3_a_id, 'delegated', 'Delegated', 'A few people lead', 2) RETURNING id INTO opt_q3_2;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, description, display_order) VALUES
  (q3_a_id, 'flexible', 'Flexible', 'Depends on the topic', 3) RETURNING id INTO opt_q3_3;

  INSERT INTO public.onboarding_questions (questionnaire_id, question_key, step_number, title, description, question_type, display_order)
  VALUES (q_id, 'pod_size', 3, 'Preferred Pod size', 'Select your preferred size of the co-housing pod.', 'single_choice', 4)
  RETURNING id INTO q3_b_id;

  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q3_b_id, '4_6', '4–6 households', 1) RETURNING id INTO opt_q3_b1;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q3_b_id, '7_10', '7–10 households', 2) RETURNING id INTO opt_q3_b2;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q3_b_id, '10+', '10+ households', 3) RETURNING id INTO opt_q3_b3;

  -- STEP 4: Location
  INSERT INTO public.onboarding_questions (questionnaire_id, question_key, step_number, title, description, question_type, display_order)
  VALUES (q_id, 'location_city', 4, 'Preferred city or metro area', 'Specify the primary city or region you want to live in.', 'text', 5)
  RETURNING id INTO q4_a_id;

  INSERT INTO public.onboarding_questions (questionnaire_id, question_key, step_number, title, description, question_type, display_order)
  VALUES (q_id, 'location_radius', 4, 'Relocation radius', 'Define the maximum radius (in miles) you are willing to move from the target city.', 'range', 6)
  RETURNING id INTO q4_b_id;

  INSERT INTO public.onboarding_questions (questionnaire_id, question_key, step_number, title, description, question_type, display_order)
  VALUES (q_id, 'setting_preference', 4, 'Setting preference', 'What kind of neighborhood environment do you prefer?', 'single_choice', 7)
  RETURNING id INTO q4_c_id;

  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q4_c_id, 'urban', 'Urban', 1) RETURNING id INTO opt_q4_c1;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q4_c_id, 'suburban', 'Suburban', 2) RETURNING id INTO opt_q4_c2;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q4_c_id, 'rural', 'Rural', 3) RETURNING id INTO opt_q4_c3;

  -- STEP 5: Budget & Financing
  INSERT INTO public.onboarding_questions (questionnaire_id, question_key, step_number, title, description, question_type, display_order)
  VALUES (q_id, 'budget_range', 5, 'Estimated purchase budget range', 'Input your approximate house purchase budget.', 'text', 8)
  RETURNING id INTO q5_a_id;

  INSERT INTO public.onboarding_questions (questionnaire_id, question_key, step_number, title, description, question_type, display_order)
  VALUES (q_id, 'down_payment_tier', 5, 'Down payment readiness tier', 'Select the down payment percentage you have saved.', 'single_choice', 9)
  RETURNING id INTO q5_b_id;

  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q5_b_id, 'dp_0_5', '0–5%', 1) RETURNING id INTO opt_q5_b1;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q5_b_id, 'dp_5_10', '5–10%', 2) RETURNING id INTO opt_q5_b2;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q5_b_id, 'dp_10_20', '10–20%', 3) RETURNING id INTO opt_q5_b3;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q5_b_id, 'dp_20+', '20%+', 4) RETURNING id INTO opt_q5_b4;

  INSERT INTO public.onboarding_questions (questionnaire_id, question_key, step_number, title, description, question_type, display_order)
  VALUES (q_id, 'financing_preference', 5, 'Financing preference', 'What is your preferred house purchase financing style?', 'single_choice', 10)
  RETURNING id INTO q5_c_id;

  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q5_c_id, 'traditional', 'Traditional mortgage', 1) RETURNING id INTO opt_q5_c1;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q5_c_id, 'shared', 'Shared equity', 2) RETURNING id INTO opt_q5_c2;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q5_c_id, 'co-dev', 'Co-development', 3) RETURNING id INTO opt_q5_c3;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q5_c_id, 'undecided', 'Undecided', 4) RETURNING id INTO opt_q5_c4;

  -- STEP 6: Primary Housing Intent
  INSERT INTO public.onboarding_questions (questionnaire_id, question_key, step_number, title, description, question_type, display_order)
  VALUES (q_id, 'housing_intent', 6, 'What are your goals for this community housing?', 'Select the primary intent for this property.', 'single_choice', 11)
  RETURNING id INTO q6_id;

  INSERT INTO public.onboarding_question_options (question_id, option_key, label, description, display_order) VALUES
  (q6_id, 'purchase', 'Purchase primary residence', 'Where you''ll live day to day', 1) RETURNING id INTO opt_q6_1;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, description, display_order) VALUES
  (q6_id, 'co-develop', 'Co-develop property', 'Build alongside your Pod', 2) RETURNING id INTO opt_q6_2;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, description, display_order) VALUES
  (q6_id, 'investment', 'Investment hold', 'Not your primary home', 3) RETURNING id INTO opt_q6_3;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, description, display_order) VALUES
  (q6_id, 'co-living', 'Lifestyle-based co-living', 'Shared spaces, shared living', 4) RETURNING id INTO opt_q6_4;

  -- STEP 7: Commitment Duration
  INSERT INTO public.onboarding_questions (questionnaire_id, question_key, step_number, title, description, question_type, display_order)
  VALUES (q_id, 'commitment_timeline', 7, 'Minimum commitment timeline', 'This sets your exit tolerance — how easily you''d want to leave a Pod if it''s not working.', 'single_choice', 12)
  RETURNING id INTO q7_id;

  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q7_id, 'timeline_2yr', '2+ years', 1) RETURNING id INTO opt_q7_1;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q7_id, 'timeline_5yr', '5+ years', 2) RETURNING id INTO opt_q7_2;
  INSERT INTO public.onboarding_question_options (question_id, option_key, label, display_order) VALUES
  (q7_id, 'timeline_flexible', 'Flexible', 3) RETURNING id INTO opt_q7_3;

  -- Seed readiness rules
  -- Under decision styles: consensus (85 points), flexible (75 points), delegated (60 points)
  INSERT INTO public.readiness_scoring_rules (question_id, option_id, score_value) VALUES
  (q3_a_id, opt_q3_1, 85),
  (q3_a_id, opt_q3_2, 60),
  (q3_a_id, opt_q3_3, 75);

  -- Under budget tiers: 20%+ (95 pts), 10-20% (85 pts), 5-10% (70 pts), 0-5% (50 pts)
  INSERT INTO public.readiness_scoring_rules (question_id, option_id, score_value) VALUES
  (q5_b_id, opt_q5_b1, 50),
  (q5_b_id, opt_q5_b2, 70),
  (q5_b_id, opt_q5_b3, 85),
  (q5_b_id, opt_q5_b4, 95);

  -- Under commitment timelines: 5+ yr (90 pts), 2+ yr (75 pts), flexible (60 pts)
  INSERT INTO public.readiness_scoring_rules (question_id, option_id, score_value) VALUES
  (q7_id, opt_q7_1, 75),
  (q7_id, opt_q7_2, 90),
  (q7_id, opt_q7_3, 60);

END $$;

-- Seed default matching weights
INSERT INTO public.matching_weights (variable_key, weight) VALUES
('lifestyle', 30),
('location', 30),
('readiness', 20),
('commitment', 20)
ON CONFLICT (variable_key) DO UPDATE SET weight = EXCLUDED.weight;

-- 13. Path B Existing Pod Tables
CREATE TABLE IF NOT EXISTS public.pods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  group_type text,
  status text DEFAULT 'CREATING' CHECK (status IN ('CREATING', 'UNDER_REVIEW', 'ACTIVE', 'REJECTED')),
  rejection_reason text,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pod_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id uuid REFERENCES public.pods(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  role text DEFAULT 'MEMBER' CHECK (role IN ('CREATOR', 'MEMBER')),
  membership_status text DEFAULT 'ACCEPTED' CHECK (membership_status IN ('ACCEPTED', 'PENDING', 'DECLINED')),
  joined_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(pod_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.pod_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id uuid REFERENCES public.pods(id) ON DELETE CASCADE,
  email text NOT NULL,
  invited_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  token_hash text NOT NULL UNIQUE,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED')),
  expires_at timestamp with time zone NOT NULL,
  accepted_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Disable Row Level Security on all Path B tables to align with BOMA's custom table auth
ALTER TABLE public.pods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_invitations DISABLE ROW LEVEL SECURITY;
