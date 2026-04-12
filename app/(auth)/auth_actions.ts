// ============================================================
// FILE LOCATION: app/(auth)/auth_actions.ts
// ============================================================
"use server";

import { createServerSupabaseClient } from "../utils/supabase_client";

export async function sendOtp(email: string, role: "admin" | "member") {
  const supabase = createServerSupabaseClient();

  try {
    // ------------------------------------------------------------------
    // STEP 1: If it's a member, enforce the strict eligibility check
    // ------------------------------------------------------------------
    if (role === "member") {
      const { data: isEligible, error: rpcError } = await supabase.rpc(
        "check_staff_eligibility",
        { p_email: email }
      );

      if (rpcError) {
        console.error("RPC Eligibility check error:", rpcError);
        return { 
          success: false, 
          message: "A system error occurred. Please try again later." 
        };
      }

      if (!isEligible) {
        return { 
          success: false, 
          message: "No active account or pending invitation found for this email. Please contact your organization administrator." 
        };
      }
    }

    // ------------------------------------------------------------------
    // STEP 2: Send the OTP (Executes for both Admins, and approved Members)
    // ------------------------------------------------------------------
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // Members with pending invites don't have an auth record yet, 
        // so we still need this to be true so Supabase creates the user account.
        shouldCreateUser: true, 
      },
    });

    if (authError) {
      console.error("OTP Error:", authError.message);
      return { success: false, message: authError.message };
    }

    return { success: true, message: "Verification code sent!" };

  } catch (error) {
    console.error("Unexpected error in sendOtp:", error);
    return { 
      success: false, 
      message: "An unexpected error occurred. Please try again." 
    };
  }
}