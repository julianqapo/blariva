-- ==============================================================================
-- FUNCTION: public.get_member_company_id
-- PURPOSE: Retrieves the company ID (id_company) for the currently authenticated 
--          and active staff member. Used to securely route users to their specific 
--          workspace or strictly scope their database queries to their organization.
-- ==============================================================================

-- 1. CLEANUP
DROP FUNCTION IF EXISTS public.get_member_company_id();

-- 2. CREATE FUNCTION
CREATE OR REPLACE FUNCTION public.get_member_company_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  -- Securely check the staff table using the built-in Supabase session ID
  SELECT id_company INTO v_company_id
  FROM public.staff
  WHERE id = auth.uid() 
    AND is_active = true
  LIMIT 1;

  -- This returns the UUID of the company, or NULL if they are not an active staff member
  RETURN v_company_id;
END;
$$;