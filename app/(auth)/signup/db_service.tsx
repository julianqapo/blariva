// create a server-side function to create a new user in the database

import { createServerSupabaseClient } from "../utils/supabase_client";

export async function createUser(email: string, password: string) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) {
        throw error;
    }
    return data;
}