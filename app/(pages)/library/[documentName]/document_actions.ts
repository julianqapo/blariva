// ============================================================
// FILE LOCATION: app/(pages)/library/[documentName]/document_actions.ts
// ============================================================
"use server";

import { createServerSupabaseClient } from "../../../utils/supabase_client";

/**
 * Fetches a container by its name (used from the [documentName] route param).
 * Returns the container id and id_company needed for uploads.
 */
export async function fetchContainerByName(containerName: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("container")
    .select("id, name, id_company, description")
    .eq("name", containerName)
    .single();

  if (error || !data) {
    return {
      success: false,
      message: "Container not found.",
      data: null,
    };
  }

  return {
    success: true,
    message: "Container found.",
    data,
  };
}

/**
 * Fetches all documents belonging to a container.
 */
export async function fetchDocumentsByContainer(containerId: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("document")
    .select("id, name, path, file_size, id_file_status, created_at")
    .eq("id_container", containerId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      success: false,
      message: "Could not fetch documents.",
      data: [],
    };
  }

  return {
    success: true,
    message: "Documents fetched.",
    data: data || [],
  };
}
