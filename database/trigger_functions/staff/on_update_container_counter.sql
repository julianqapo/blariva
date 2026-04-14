-- ==============================================================================
-- TRIGGER FUNCTION: public.update_container_counter
-- PURPOSE: Maintains an accurate document count in the container table.
--          Automatically handles both +1 (on INSERT) and -1 (on DELETE).
-- ==============================================================================

-- 1. CLEANUP (Remove the old separate triggers if they exist)
DROP TRIGGER IF EXISTS document_counter_trigger ON public.document;
DROP FUNCTION IF EXISTS public.on_update_container_counter();

-- 2. CREATE THE UNIFIED FUNCTION
CREATE OR REPLACE FUNCTION public.on_update_container_counter()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Handle INSERTS (+1)
  IF TG_OP = 'INSERT' THEN
    UPDATE public.container
    SET counter = COALESCE(counter, 0) + 1
    WHERE id = NEW.id_container;
    
    RETURN NEW; -- Must return NEW for inserts
  
  -- Handle DELETES (-1)
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.container
    SET counter = GREATEST(COALESCE(counter, 0) - 1, 0) -- GREATEST prevents negative numbers
    WHERE id = OLD.id_container;
    
    RETURN OLD; -- Must return OLD for deletes
  END IF;

  RETURN NULL; -- Fallback
END;
$$;

-- 3. CREATE THE SINGLE TRIGGER
-- Notice how we combine INSERT OR DELETE into one line here
CREATE TRIGGER document_counter_trigger
AFTER INSERT OR DELETE ON public.document
FOR EACH ROW
EXECUTE FUNCTION public.on_update_container_counter();