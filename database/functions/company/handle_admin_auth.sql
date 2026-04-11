-- 1. CLEANUP
DROP FUNCTION IF EXISTS public.handle_admin_auth();

-- 2. CREATE FUNCTION
CREATE OR REPLACE FUNCTION public.handle_admin_auth()
RETURNS jsonb 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text; -- FIX 1: Added semicolon
  v_uid uuid;
  v_company_id uuid;
  v_staff_id uuid;
  v_new_id uuid;
BEGIN
  -- ==========================================
  -- Step 0: Extract email from JWT safely
  -- ==========================================
  -- FIX 2: Used := for assignment and added semicolon
  -- Note: auth.email() is a built-in Supabase wrapper for auth.jwt()->>'email'
  v_email := auth.email(); 
  v_uid := auth.uid();

  IF v_email IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Unauthorized: No verified session found.',
      'data', null
    );
  END IF;

  -- ==========================================
  -- Step 1: Check if email exists in COMPANY
  -- ==========================================
  SELECT id INTO v_company_id 
  FROM public.company 
  WHERE email = v_email AND id = v_uid
  LIMIT 1;

  IF v_company_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Welcome back. Company record found.',
      'data', jsonb_build_object(
        'id', v_company_id, 
        'role', 'Admin'
      )
    );
  END IF;

  -- ==========================================
  -- Step 2: Check if email exists in STAFF
  -- ==========================================
  SELECT id INTO v_staff_id 
  FROM public.staff 
  WHERE email = v_email AND is_active = true AND id = v_uid
  LIMIT 1;

  IF v_staff_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'This user is associated with another organization, deactivate first to register.',
      'data', null
    );
  END IF;

  -- ==========================================
  -- Step 3: If neither exists, CREATE COMPANY
  -- ==========================================
  INSERT INTO public.company (
    expiry_date
  ) VALUES (
    CURRENT_DATE + INTERVAL '30 days'
  )
  RETURNING id INTO v_new_id;

  -- ==========================================
  -- Step 4: Log the creation event
  -- ==========================================
  INSERT INTO public.log (
    note,
    id_company,
    email_staff
  ) VALUES (
    format('Organization created via Initial Sign-Up. Email: "%s", Expiry Date: %s.', 
           v_email, 
           (CURRENT_DATE + INTERVAL '30 days')::date),
           v_new_id,
           v_email
           );

  -- ==========================================
  -- Step 5: Return Success Payload
  -- ==========================================
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Company created successfully.',
    'data', jsonb_build_object(
      'id', v_new_id, 
      'role', 'Admin'
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