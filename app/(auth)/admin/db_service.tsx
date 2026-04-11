// create a server-side function to create a new user in the database

import { createServerSupabaseClient } from "../../utils/supabase_client";



export async function signupWithMagicLink(email: string) {
    const supabase = createServerSupabaseClient();
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      // 2. Make sure this matches your localhost port!
      emailRedirectTo: redirectUrl,
      shouldCreateUser: true, 
    },
  })

  if (error) {
    // 3. Keep an eye on "Email rate limit exceeded" errors during testing
    console.error('Error:', error.message)
    alert(error.message)
  } else {
    alert('Success! Check your inbox.')
  }
}