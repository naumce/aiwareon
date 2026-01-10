-- Fix credit_ledger RLS to allow users to insert their own records
-- This allows frontend to deduct/refund credits while keeping them secure

-- Add INSERT policy for users to manage their own credits
CREATE POLICY "credit_ledger: insert own" ON public.credit_ledger
  FOR INSERT WITH CHECK (auth.uid() = user_id);
