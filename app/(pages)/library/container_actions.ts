// ============================================================
// FILE LOCATION: app/actions/container_actions.ts
// ============================================================
"use server";

import { createServerSupabaseClient } from "../../utils/supabase_client";

export async function createContainer(containerName: string, description: string) {
  const supabase = createServerSupabaseClient();

  // Call the secure RPC function with both parameters
  const { data, error } = await supabase.rpc("add_container", {
    p_name: containerName,
    p_description: description
  });

  if (error) {
    console.error("Database connection error:", error);
    return { 
      success: false, 
      message: "System error: Could not connect to the database." 
    };
  }

  return data; 
}


export async function deleteContainer(containerId: string) {
  const supabase = createServerSupabaseClient();

  // Call the secure RPC function
  const { data, error } = await supabase.rpc("delete_container", {
    p_container_id: containerId
  });

  // Handle connection errors
  if (error) {
    console.error("Database connection error:", error);
    return { 
      success: false, 
      message: "System error: Could not connect to the database." 
    };
  }

  // Returns the formatted JSON object from the database
  return data;
}

export async function updateContainer(containerId: string, newName: string, newDescription: string) {
  const supabase = createServerSupabaseClient();

  // Call the secure RPC function
  const { data, error } = await supabase.rpc("update_container", {
    p_container_id: containerId,
    p_new_name: newName,
    p_new_description: newDescription
  });

  // Handle connection errors
  if (error) {
    console.error("Database connection error:", error);
    return { 
      success: false, 
      message: "System error: Could not connect to the database." 
    };
  }

  // Returns the formatted JSON object from the database
  return data;
}


export async function fetchContainers() {
  const supabase = createServerSupabaseClient();

  // Call the secure RPC function
  const { data, error } = await supabase.rpc("get_containers");

  // Handle connection errors
  if (error) {
    console.error("Database connection error:", error);
    return { 
      success: false, 
      message: "System error: Could not fetch containers.", 
      data: [] 
    };
  }

  // Returns the formatted JSON object containing the array of containers
  return data;
}