-- ==============================================================================
-- FUNCTION: public.delete_container
-- PURPOSE: Deletes an existing container. Includes a strict check to ensure 
--          the organization's subscription is active (expiry_date >= CURRENT_DATE).
--          Enforces tenant isolation by requiring id_company to match, and securely 
--          logs the deletion event for auditing purposes.
-- ==============================================================================

-- 1. CLEANUP
DROP FUNCTION IF EXISTS public.delete_container(uuid);

-- 2. CREATE FUNCTION
CREATE OR REPLACE FUNCTION public.delete_container(p_container_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace jsonb;
  v_company_id uuid;
  v_company_email text;
  v_expiry_date date;
  v_deleted_name text;
  v_email text;
BEGIN
  -- Step 1: Securely get the user's email and their active company ID
  v_email := auth.email();
  v_workspace := public.get_member_company_id();
  v_company_id := (v_workspace->>'id')::uuid;
  v_company_email := (v_workspace->>'email')::text;

  -- Step 2: Security Check - Block if they are deactivated or have no workspace
  IF v_company_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Unauthorized: You do not have access to an active workspace.', 
      'data', null
    );
  END IF;

  -- Step 3: Subscription Expiry Check (The Gatekeeper)
  SELECT expiry_date INTO v_expiry_date 
  FROM public.company 
  WHERE id = v_company_id;

  IF v_expiry_date < CURRENT_DATE THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Your organization subscription has expired. Please renew to modify containers.', 
      'data', null
    );
  END IF;

  -- Step 4: Delete the container ONLY if it belongs to their company
  -- We use RETURNING name to capture what was deleted for the audit log
  DELETE FROM public.container
  WHERE id = p_container_id AND id_company = v_company_id
  RETURNING name INTO v_deleted_name;

  -- Step 5: If no name was returned, the container either doesn't exist or isn't theirs
  IF v_deleted_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Container not found or access denied.', 
      'data', null
    );
  END IF;

  -- Step 6: Log the deletion event
  INSERT INTO public.log (
    note, 
    id_company, 
    email_staff
  ) VALUES (
    format('Deleted container "%s".', v_deleted_name), 
    v_company_id, 
    v_email
  );

  -- Step 7: Return Success Payload
  RETURN jsonb_build_object(
    'success', true, 
    'message', format('Container "%s" deleted successfully.', v_deleted_name), 
    'data', null
  );

EXCEPTION WHEN OTHERS THEN
  -- Catch any unexpected database errors
  RETURN jsonb_build_object(
    'success', false, 
    'message', SQLERRM, 
    'data', null
  );
END;
$$;