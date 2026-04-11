// app/(auth)/admin/db_service.tsx  (and staff/db_service.tsx)
'use server'

import { createServerSupabaseClient } from "../../utils/supabase_client";

export async function signupWithMagicLink(email: string, role: 'admin' | 'staff') {
  const supabase =  createServerSupabaseClient();
  
  // Fallback to localhost for local testing, but use production URL when deployed
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?role=${role}`,
      shouldCreateUser: true, 
    },
  });

  if (error) {
    console.error('Magic Link Error:', error.message);
    return { success: false, message: error.message };
  } 
  
  return { success: true };
}