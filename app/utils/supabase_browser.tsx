// FILE: app/utils/supabase_browser.tsx
import { createBrowserClient } from '@supabase/ssr'


const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;


export function createBrowserSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase credentials are missing in .env.local");
  }

  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
}