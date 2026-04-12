-- ==============================================================================
-- FUNCTION: public.check_staff_eligibility
-- PURPOSE: Acts as a pre-check before sending a Magic Link OTP. 
--          Verifies if an email belongs to an active staff member or has a 
--          pending invitation. Prevents unauthorized users from wasting email 
--          quotas or getting stuck in a dead-end login flow.
-- ==============================================================================

-- 1. CLEANUP
DROP FUNCTION IF EXISTS public.check_staff_eligibility(text);

-- 2. CREATE FUNCTION
CREATE OR REPLACE FUNCTION public.check_staff_eligibility(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Step 1: Check the pending signup table FIRST (fast short-circuit)
  IF EXISTS (
    SELECT 1 FROM public.staff_pending_signup 
    WHERE email = p_email
  ) THEN
    RETURN true;
  END IF;

  -- Step 2: If not pending, check if they are already an active staff member
  RETURN EXISTS (
    SELECT 1 FROM public.staff 
    WHERE email = p_email AND is_active = true
  );
END;
$$;