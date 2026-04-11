-- 1. CLEANUP
DROP FUNCTION IF EXISTS public.handle_staff_auth();

-- 2. CREATE FUNCTION
CREATE OR REPLACE FUNCTION public.handle_staff_auth()
RETURNS jsonb 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_uid uuid;
  v_staff_id uuid;
  v_company_id uuid;
  v_pending_company_id uuid;
BEGIN
  -- ==========================================
  -- Step 0: Extract auth details safely
  -- ==========================================
  v_email := auth.email(); 
  v_uid := auth.uid();

  IF v_email IS NULL OR v_uid IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Unauthorized: No verified session found.',
      'data', null
    );
  END IF;

  -- ==========================================
  -- Step 1: Check if active staff exists
  -- ==========================================
  SELECT id INTO v_staff_id 
  FROM public.staff 
  WHERE email = v_email AND id = v_uid AND is_active = true 
  LIMIT 1;

  IF v_staff_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Welcome back. Staff record found.',
      'data', jsonb_build_object(
        'id', v_staff_id, 
        'role', 'Staff'
      )
    );
  END IF;

  -- ==========================================
  -- Step 2: Check if email exists in COMPANY
  -- ==========================================
  SELECT id INTO v_company_id 
  FROM public.company 
  WHERE email = v_email
  LIMIT 1;

  IF v_company_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'This email is already registered as an organization, use a different email.',
      'data', null
    );
  END IF;

  -- ==========================================
  -- Step 3: Check pending signups
  -- ==========================================
  SELECT id_company INTO v_pending_company_id 
  FROM public.staff_pending_signup 
  WHERE email = v_email 
  LIMIT 1;

  IF v_pending_company_id IS NULL THEN
    -- If they aren't an active staff, aren't an admin, and have no pending invite:
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No pending invitation found for this email. Please contact your organization administrator.',
      'data', null
    );
  END IF;

  -- ==========================================
  -- Step 4: Insert new staff record
  -- ==========================================
  INSERT INTO public.staff (
    id_company
  ) VALUES (
    v_pending_company_id
  )
  RETURNING id INTO v_staff_id;

  -- ==========================================
  -- Step 5: Log the registration event
  -- ==========================================
  INSERT INTO public.log (
    note,
    id_company,
    email_staff
  ) VALUES (
    format('Staff member registered via invitation. Email: "%s".', v_email),
    v_pending_company_id,
    v_email
  );

  -- ==========================================
  -- Step 6: Return Success Payload
  -- ==========================================
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Staff registration completed successfully.',
    'data', jsonb_build_object(
      'id', v_staff_id, 
      'id_company', v_pending_company_id,
      'role', 'Staff'
    )
  );

EXCEPTION WHEN OTHERS THEN
  -- ==========================================
  -- Catch System Errors
  -- ==========================================
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM, 
    'data', null
  );
END;
$$;