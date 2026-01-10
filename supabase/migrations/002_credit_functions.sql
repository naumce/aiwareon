-- Credit Operations (P0 - Security Critical)
-- Run this in Supabase SQL Editor after 001_initial_schema.sql

-- ============================================
-- DEDUCT CREDITS (per 04_GENERATION_PATTERN.md)
-- ============================================
-- Credits are deducted BEFORE generation starts

CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'generation',
  p_reference_id UUID DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_balance INTEGER;
  v_user_id UUID;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  -- Get current balance
  SELECT COALESCE(SUM(delta), 0) INTO current_balance
  FROM public.credit_ledger
  WHERE user_id = v_user_id;
  
  -- Check sufficient balance
  IF current_balance < p_amount THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Insufficient credits',
      'balance', current_balance,
      'required', p_amount
    );
  END IF;
  
  -- Deduct credits (negative delta)
  INSERT INTO public.credit_ledger (user_id, delta, reason, reference_id)
  VALUES (v_user_id, -p_amount, p_reason, p_reference_id);
  
  RETURN json_build_object(
    'success', true, 
    'balance', current_balance - p_amount
  );
END;
$$;

-- ============================================
-- REFUND CREDITS (per 12_ERROR_AND_FAILURE_PATTERN.md)
-- ============================================
-- Credits are refunded on generation failure

CREATE OR REPLACE FUNCTION public.refund_credits(
  p_amount INTEGER,
  p_reference_id UUID,
  p_reason TEXT DEFAULT 'generation_failed'
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  new_balance INTEGER;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  -- Add credits back (positive delta)
  INSERT INTO public.credit_ledger (user_id, delta, reason, reference_id)
  VALUES (v_user_id, p_amount, p_reason, p_reference_id);
  
  -- Get new balance
  SELECT COALESCE(SUM(delta), 0) INTO new_balance
  FROM public.credit_ledger
  WHERE user_id = v_user_id;
  
  RETURN json_build_object(
    'success', true, 
    'balance', new_balance,
    'refunded', p_amount
  );
END;
$$;

-- ============================================
-- ADD CREDITS (for purchases via webhook)
-- ============================================
-- Only callable via service role (webhook)

CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'purchase',
  p_reference_id UUID DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  -- Add credits
  INSERT INTO public.credit_ledger (user_id, delta, reason, reference_id)
  VALUES (p_user_id, p_amount, p_reason, p_reference_id);
  
  -- Get new balance
  SELECT COALESCE(SUM(delta), 0) INTO new_balance
  FROM public.credit_ledger
  WHERE user_id = p_user_id;
  
  RETURN json_build_object(
    'success', true, 
    'balance', new_balance
  );
END;
$$;
