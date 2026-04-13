-- ==============================================================================
-- FUNCTION: public.get_containers
-- PURPOSE: Retrieves all containers for the active staff member's organization.
--          Securely scopes the query using get_member_company_id() so users 
--          can ONLY see containers belonging to their tenant.
--          NOTE: Bypasses the subscription expiry check to allow read-only access.
-- ==============================================================================

-- 1. CLEANUP
DROP FUNCTION IF EXISTS public.get_containers();

-- 2. CREATE FUNCTION
CREATE OR REPLACE FUNCTION public.get_containers()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace jsonb;
  v_company_id uuid;
  v_company_email text;
  v_result jsonb;
BEGIN
  -- Step 1: Securely fetch the active company ID
  v_workspace := public.get_member_company_id();
  v_company_id := (v_workspace->>'id')::uuid;
  v_company_email := (v_workspace->>'email')::text;

  -- Step 2: Security Check - Block if they are deactivated or have no workspace
  IF v_company_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Unauthorized: You do not have access to an active workspace.', 
      'data', '[]'::jsonb
    );
  END IF;

  -- Step 3: Fetch the containers (No expiry check here!)
  -- We aggregate the rows into a JSON array, sorted newest first. 
  -- COALESCE ensures we return '[]' instead of NULL if they have no containers yet.
  SELECT COALESCE(jsonb_agg(row_to_json(c)), '[]'::jsonb) INTO v_result
  FROM (
    SELECT *
    FROM public.container
    WHERE id_company = v_company_id
    ORDER BY name DESC
  ) c;

  -- Step 4: Return Success Payload
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Containers fetched successfully.', 
    'data', v_result
  );

EXCEPTION WHEN OTHERS THEN
  -- Catch unexpected errors
  RETURN jsonb_build_object(
    'success', false, 
    'message', SQLERRM, 
    'data', '[]'::jsonb
  );
END;
$$;