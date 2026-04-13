-- ==============================================================================
-- FUNCTION: public.add_container
-- PURPOSE: Creates a new container for the active staff member's organization.
--          Includes a strict check to ensure the organization's subscription
--          is active (expiry_date >= CURRENT_DATE) before allowing creation.
-- ==============================================================================

-- 1. CLEANUP
DROP FUNCTION IF EXISTS public.add_container(text, text);

-- 2. CREATE FUNCTION
CREATE OR REPLACE FUNCTION public.add_container(p_name text, p_description text)
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
  v_container_id uuid;
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
      'message', 'Your organization subscription has expired. Please renew to add containers.',
      'data', null
    );
  END IF;

  -- Step 4: Prevent empty names
  IF trim(p_name) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Container name cannot be empty.',
      'data', null
    );
  END IF;

  -- Step 5: Insert the new container
  INSERT INTO public.container (
    name,
    description,
    id_company
  ) VALUES (
    trim(p_name),
    trim(p_description),
    v_company_id
  )
  RETURNING id INTO v_container_id;

  -- Step 6: Log the creation event
  INSERT INTO public.log (
    note,
    id_company,
    email_staff
  ) VALUES (
    format('Created a new container named "%s".', trim(p_name)),
    v_company_id,
    v_email
  );

  -- Step 7: Return Success Payload
  RETURN jsonb_build_object(
    'success', true,
    'message', format('Container "%s" created successfully.', trim(p_name)),
    'data', jsonb_build_object(
      'id', v_container_id,
      'name', trim(p_name),
      'description', trim(p_description)
    )
  );

EXCEPTION WHEN OTHERS THEN
  -- Catch any database constraint errors
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM, 
    'data', null
  );
END;
$$;