-- ==============================================================================
-- FUNCTION: public.update_container
-- PURPOSE: Updates the name and description of an existing container.
--          Includes a strict check to ensure the organization's subscription
--          is active. Fetches the old name prior to updating to provide a 
--          clear, human-readable audit log.
-- ==============================================================================

-- 1. CLEANUP
DROP FUNCTION IF EXISTS public.update_container(uuid, text, text);

-- 2. CREATE FUNCTION
CREATE OR REPLACE FUNCTION public.update_container(p_container_id uuid, p_new_name text, p_new_description text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_expiry_date date;
  v_updated_id uuid;
  v_email text;
  v_old_name text; -- NEW: Variable to hold the original name
BEGIN
  -- Step 1: Securely get the user's email and their active company ID
  v_email := auth.email();
  v_company_id := public.get_member_company_id();

  -- Step 2: Security Check - Block if they are deactivated or have no workspace
  IF v_company_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Unauthorized: You do not have access to an active workspace.', 
      'data', null
    );
  END IF;

  -- Step 3: Subscription Expiry Check
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

  -- Step 4: Prevent empty names
  IF trim(p_new_name) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Container name cannot be empty.',
      'data', null
    );
  END IF;

  -- Step 5: Fetch the OLD name before we change it
  SELECT name INTO v_old_name
  FROM public.container
  WHERE id = p_container_id AND id_company = v_company_id;

  -- If no old name was found, the container either doesn't exist or isn't theirs
  IF v_old_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Container not found or access denied.', 
      'data', null
    );
  END IF;

  -- Step 6: Update the container
  UPDATE public.container 
  SET 
    name = trim(p_new_name), 
    description = trim(p_new_description)
  WHERE id = p_container_id AND id_company = v_company_id
  RETURNING id INTO v_updated_id;

  -- Step 7: Log the update event using the clear, human-readable format
  INSERT INTO public.log (
    note, 
    id_company, 
    email_staff
  ) VALUES (
    format('Renamed container from "%s" to "%s".', v_old_name, trim(p_new_name)), 
    v_company_id, 
    v_email
  );

  -- Step 8: Return Success Payload
  RETURN jsonb_build_object(
    'success', true, 
    'message', format('Container updated to "%s" successfully.', trim(p_new_name)), 
    'data', jsonb_build_object(
      'id', v_updated_id,
      'name', trim(p_new_name),
      'description', trim(p_new_description)
    )
  );

EXCEPTION WHEN OTHERS THEN
  -- Catch any unexpected database errors (e.g., unique name constraint violations)
  RETURN jsonb_build_object(
    'success', false, 
    'message', SQLERRM, 
    'data', null
  );
END;
$$;