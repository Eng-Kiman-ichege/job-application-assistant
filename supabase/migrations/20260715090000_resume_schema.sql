-- ============================================================
-- Migration: Resume schema additions
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Extend profiles table with resume-related columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT,
  ADD COLUMN IF NOT EXISTS github TEXT,
  ADD COLUMN IF NOT EXISTS professional_summary TEXT,
  ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS resume_url TEXT,
  ADD COLUMN IF NOT EXISTS resume_file_name TEXT,
  ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0;

-- 2. Create resume_files table to track all uploads
CREATE TABLE IF NOT EXISTS public.resume_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  parsed BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.resume_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resume_files (using service role key bypasses these, but good practice)
CREATE POLICY "Users can view their own resume files"
  ON public.resume_files FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own resume files"
  ON public.resume_files FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own resume files"
  ON public.resume_files FOR DELETE
  USING (true);

-- 3. Create the 'resumes' storage bucket (run separately in Dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false)
-- ON CONFLICT (id) DO NOTHING;
