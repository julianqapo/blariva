import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../utils/supabase_client'; // Your Supabase SSR setup

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const role = searchParams.get('role'); // We passed this from the login form!

  if (code) {
    const supabase = createServerSupabaseClient();
    
    // 1. Exchange the code for a secure session
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (!sessionError) {
      // 2. Session is active. Now run the correct Database Function.
      const rpcName = role === 'admin' ? 'handle_admin_auth' : 'handle_staff_auth';
      const { data: response, error: rpcError } = await supabase.rpc(rpcName);

      if (rpcError) {
        // Catastrophic database error
        return NextResponse.redirect(`${origin}/${role}?error=SystemError`);
      }

      // 3. Handle the Business Logic based on your JSON response structure
      if (response.success) {
        // Successfully processed. Redirect to the correct dashboard.
        const redirectPath = role === 'admin' ? '/dashboard' : '/dashboard';
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else {
        // Logged in via Supabase, but blocked by your DB logic (e.g., active staff trying to register as admin)
        // You should ideally sign them out here since they failed authorization
        await supabase.auth.signOut();
        
        // Redirect back to login with the error message from your database
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(response.message)}`);
      }
    }
  }

  // Fallback if no code is present or the link expired
  return NextResponse.redirect(`${origin}/login?error=InvalidLink`);
}