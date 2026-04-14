-- ==============================================================================
-- FUNCTION: public.update_document_name
-- PURPOSE: Safely renames a document. Enforces tenant isolation, checks 
--          subscription expiry, and logs the old/new name for auditing.
-- ==============================================================================

-- 1. CLEANUP
DROP FUNCTION IF EXISTS public.update_document_name(uuid, text);

-- 2. CREATE FUNCTION
CREATE OR REPLACE FUNCTION public.update_document_name(p_document_id uuid, p_new_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace jsonb;
  v_company_id uuid;
  v_email text;
  v_expiry_date date;
  v_old_name text;
  v_updated_id uuid;
BEGIN
  -- Step 1: Securely get the user's workspace info (parsing the JSON return)
  v_workspace := public.get_member_company_id();
  
  IF v_workspace IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Unauthorized: You do not have access to an active workspace.', 
      'data', null
    );
  END IF;

  v_company_id := (v_workspace->>'id')::uuid;
  v_email := v_workspace->>'email';

  -- Step 2: Subscription Expiry Check
  SELECT expiry_date INTO v_expiry_date 
  FROM public.company 
  WHERE id = v_company_id;

  IF v_expiry_date < CURRENT_DATE THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Your organization subscription has expired. Please renew to modify documents.', 
      'data', null
    );
  END IF;

  -- Step 3: Prevent empty names
  IF trim(p_new_name) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Document name cannot be empty.',
      'data', null
    );
  END IF;

  -- Step 4: Fetch the OLD name before we change it (and verify ownership)
  SELECT name INTO v_old_name
  FROM public.document
  WHERE id = p_document_id AND id_company = v_company_id;

  IF v_old_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Document not found or access denied.', 
      'data', null
    );
  END IF;

  -- Step 5: Update the document
  UPDATE public.document 
  SET 
    name = trim(p_new_name)
    -- If you have an updated_at column, uncomment the line below:
    -- , updated_at = NOW() 
  WHERE id = p_document_id AND id_company = v_company_id
  RETURNING id INTO v_updated_id;

  -- Step 6: Log the update event
  INSERT INTO public.log (
    note, 
    id_company, 
    email_staff
  ) VALUES (
    format('Renamed document from "%s" to "%s".', v_old_name, trim(p_new_name)), 
    v_company_id, 
    v_email
  );

  -- Step 7: Return Success Payload
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Document renamed successfully.', 
    'data', jsonb_build_object(
      'id', v_updated_id,
      'name', trim(p_new_name)
    )
  );

EXCEPTION WHEN OTHERS THEN
  -- Catch unexpected errors
  RETURN jsonb_build_object(
    'success', false, 
    'message', SQLERRM, 
    'data', null
  );
END;
$$;