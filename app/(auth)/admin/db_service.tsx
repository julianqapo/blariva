"use server";

import { createServerSupabaseClient } from "../../utils/supabase_client";

export async function sendOtp(email: string) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("OTP Error:", error.message);
    return { success: false, message: error.message };
  }

  return { success: true };
}
