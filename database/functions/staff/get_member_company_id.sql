-- ==============================================================================
-- FUNCTION: public.get_member_company_id
-- PURPOSE: Retrieves both the company ID and the company email for the 
--          currently authenticated and active staff member.
-- ==============================================================================

-- 1. CLEANUP (Note: We must drop because the return type is changing from uuid to jsonb)
DROP FUNCTION IF EXISTS public.get_member_company_id();

-- 2. CREATE FUNCTION
CREATE OR REPLACE FUNCTION public.get_member_company_id()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- We perform a JOIN to get the email directly from the company table
  SELECT 
    jsonb_build_object(
      'id', c.id,
      'email', c.email
    ) INTO v_result
  FROM public.staff s
  JOIN public.company c ON s.id_company = c.id
  WHERE s.id = auth.uid() 
    AND s.is_active = true
    AND c.expiry_date >= CURRENT_DATE -- Optional: safety check if you want to block expired here too
  LIMIT 1;

  -- Returns the object { "id": "...", "email": "..." } or NULL if not found/inactive
  RETURN v_result;
END;
$$;