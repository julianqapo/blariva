CREATE OR REPLACE FUNCTION public.create_new_company()
RETURNS jsonb 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_id uuid;
BEGIN
  -- 1. Perform the operation
  INSERT INTO public.company (
    expiry_date
  ) VALUES (
    CURRENT_DATE + INTERVAL '30 days'
  )
  RETURNING id INTO v_new_id;

  -- 2. Return Success Payload
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Company created successfully.',
    'data', jsonb_build_object('id', v_new_id) -- Nesting the ID inside the data object
  );

EXCEPTION WHEN OTHERS THEN
  -- 3. Catch Errors and Return Failure Payload
  -- SQLERRM contains the system error message (e.g., "duplicate key value violates unique constraint")
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM, 
    'data', null
  );
END;
$$;