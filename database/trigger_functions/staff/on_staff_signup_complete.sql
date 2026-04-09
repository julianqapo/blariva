-- 1. CLEANUP
DROP TRIGGER IF EXISTS tr_cleanup_pending_signup ON public.staff;
DROP FUNCTION IF EXISTS public.on_staff_signup_complete();

-- 2. CREATE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.on_staff_signup_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ==========================================
  -- ON INSERT: Remove from pending table
  -- ==========================================
  IF (TG_OP = 'INSERT') THEN
    DELETE FROM public.staff_pending_signup
    WHERE email = NEW.email;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. BIND TRIGGER TO TABLE
-- We use AFTER INSERT to ensure the staff record is successfully 
-- created before removing the pending record.
CREATE TRIGGER tr_cleanup_pending_signup
AFTER INSERT ON public.staff
FOR EACH ROW
EXECUTE FUNCTION public.on_staff_signup_complete();