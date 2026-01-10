-- AIWear Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Stores user profile data. Created automatically via trigger on auth.users insert.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only read their own profile
CREATE POLICY "profiles: read own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, is_anonymous)
  VALUES (NEW.id, NEW.is_anonymous)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. CREDIT LEDGER TABLE (Ledger-Based Credits per 03_CREDITS_PATTERN.md)
-- ============================================
-- Balance = SUM(delta). Every credit change has a reason.

CREATE TABLE IF NOT EXISTS public.credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID, -- Optional reference to generation, purchase, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only read their own ledger
CREATE POLICY "credit_ledger: read own" ON public.credit_ledger
  FOR SELECT USING (auth.uid() = user_id);

-- Index for fast balance calculation
CREATE INDEX IF NOT EXISTS credit_ledger_user_id_idx 
  ON public.credit_ledger(user_id);

-- Function to get user's credit balance
CREATE OR REPLACE FUNCTION public.get_credit_balance(p_user_id UUID DEFAULT auth.uid())
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  balance INTEGER;
BEGIN
  SELECT COALESCE(SUM(delta), 0) INTO balance
  FROM public.credit_ledger
  WHERE user_id = p_user_id;
  
  RETURN balance;
END;
$$;

-- Function to add initial credits for new users
CREATE OR REPLACE FUNCTION public.grant_initial_credits()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.credit_ledger (user_id, delta, reason)
  VALUES (NEW.id, 10, 'initial_grant');
  RETURN NEW;
END;
$$;

-- Trigger to grant initial credits on profile creation
DROP TRIGGER IF EXISTS on_profile_created_grant_credits ON public.profiles;
CREATE TRIGGER on_profile_created_grant_credits
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.grant_initial_credits();

-- ============================================
-- 3. GENERATIONS TABLE (State machine per 04_GENERATION_PATTERN.md)
-- ============================================
-- States: queued → processing → succeeded | failed

CREATE TABLE IF NOT EXISTS public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'queued' CHECK (state IN ('queued', 'processing', 'succeeded', 'failed')),
  credits_cost INTEGER NOT NULL,
  error_message TEXT,
  result_path TEXT,
  person_asset_id UUID,
  dress_asset_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "generations: read own" ON public.generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "generations: insert own" ON public.generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for listing user's generations
CREATE INDEX IF NOT EXISTS generations_user_id_created_at_idx 
  ON public.generations(user_id, created_at DESC);

-- ============================================
-- 4. MEDIA ITEMS TABLE (Assets per 05_ASSETS_PATTERN.md)
-- ============================================
-- Types: person | dress | result

CREATE TABLE IF NOT EXISTS public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('person', 'dress', 'result')),
  bucket_id TEXT NOT NULL DEFAULT 'aiwear-media',
  object_path TEXT NOT NULL,
  is_library_item BOOLEAN NOT NULL DEFAULT false,
  generation_id UUID REFERENCES public.generations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "media_items: select own" ON public.media_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "media_items: insert own" ON public.media_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "media_items: delete own" ON public.media_items
  FOR DELETE USING (auth.uid() = user_id);

-- Index for listing user's media
CREATE INDEX IF NOT EXISTS media_items_user_id_created_at_idx 
  ON public.media_items(user_id, created_at DESC);

-- Index for library items
CREATE INDEX IF NOT EXISTS media_items_library_idx 
  ON public.media_items(user_id, is_library_item) 
  WHERE is_library_item = true;
