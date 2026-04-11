-- 1. CLEANUP
DROP TRIGGER IF EXISTS tr_sync_company_owner ON public.company;
DROP FUNCTION IF EXISTS public.on_create_company_sync_owner();

-- 2. CREATE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.on_create_company_sync_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ==========================================
  -- ON INSERT: Create the initial staff record
  -- ==========================================
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.staff (
      id,
      created_at,
      email,
      id_company,
      name
    )
    VALUES (
      NEW.id,           -- Staff ID matches the Company ID exactly
      NEW.created_at,
      NEW.email,
      NEW.id,           -- Foreign Key links to the Company ID
      NEW.name
    );
    
    RETURN NEW;

  -- ==========================================
  -- ON UPDATE: Keep staff info and IDs in sync
  -- ==========================================
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE public.staff
    SET 
      id = NEW.id,          -- Updates the Primary Key if company ID changes
      id_company = NEW.id,  -- Updates the Foreign Key if company ID changes
      name = NEW.name,
      email = NEW.email
    WHERE id = OLD.id;
    
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
-- Must use AFTER so the Company ID exists to satisfy the Staff table's Foreign Key constraint.
CREATE TRIGGER tr_sync_company_owner
AFTER INSERT OR UPDATE OR DELETE ON public.company
FOR EACH ROW
EXECUTE FUNCTION public.on_create_company_sync_owner();