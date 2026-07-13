-- Recreate profiles table for Clerk authenticated users
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY, -- Clerk user ID is a string (e.g. user_2...)
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to extract Clerk User ID from custom JWT template claims
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (requesting_user_id() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (requesting_user_id() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (requesting_user_id() = id);

-- Handle updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
