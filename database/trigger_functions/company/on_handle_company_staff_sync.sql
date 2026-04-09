-- 1. CLEANUP
DROP TRIGGER IF EXISTS tr_sync_company_to_staff ON public.company;
DROP FUNCTION IF EXISTS public.on_handle_company_staff_sync();

-- 2. CREATE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.on_handle_company_staff_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ==========================================
  -- ON INSERT: Create initial staff record
  -- ==========================================
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.staff (
      id_company,
      name
    )
    VALUES (
      NEW.id,
      NEW.name
    );
    
    RETURN NEW;

  -- ==========================================
  -- ON UPDATE: Keep staff info in sync
  -- ==========================================
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Update staff records linked to this company if name or email changed
    UPDATE public.staff
    SET 
      name = NEW.name,
      email = NEW.email
    WHERE id_company = OLD.id;
    
    RETURN NEW;

  -- ==========================================
  -- ON DELETE: Cleanup associated staff
  -- ==========================================
  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM public.staff 
    WHERE id_company = OLD.id;
    
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- 3. BIND TRIGGER TO TABLE
-- Using AFTER because we need the Company ID (UUID) to exist 
-- to satisfy the Foreign Key constraint in the Staff table.
CREATE TRIGGER tr_sync_company_to_staff
AFTER INSERT OR UPDATE OR DELETE ON public.company
FOR EACH ROW
EXECUTE FUNCTION public.on_handle_company_staff_sync();