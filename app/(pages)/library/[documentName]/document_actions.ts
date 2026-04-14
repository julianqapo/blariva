// ============================================================
// FILE LOCATION: app/(pages)/library/[documentName]/document_actions.ts
// ============================================================
"use server";

import { createServerSupabaseClient } from "../../../utils/supabase_client";

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

/**
 * Creates a signed URL for a file in the document bucket.
 * Runs server-side with the user's authenticated session.
 */
export async function getSignedUrl(path: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.storage
    .from("document")
    .createSignedUrl(path, 3600); // 1 hour

  if (error || !data?.signedUrl) {
    return { success: false, url: "", message: error?.message || "Failed to create signed URL" };
  }

  return { success: true, url: data.signedUrl, message: "OK" };
}

/**
 * Downloads a text-based file and returns its content as a string.
 * Runs server-side with the user's authenticated session.
 */
export async function getTextFileContent(path: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.storage
    .from("document")
    .download(path);

  if (error || !data) {
    return { success: false, content: "", message: error?.message || "Failed to download file" };
  }

  const text = await data.text();
  return { success: true, content: text, message: "OK" };
}

/**
 * Downloads a binary file and returns it as a base64 string.
 * Used for Word documents that need client-side rendering via mammoth.js.
 */
export async function getBinaryFileBase64(path: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.storage
    .from("document")
    .download(path);

  if (error || !data) {
    return { success: false, base64: "", message: error?.message || "Failed to download file" };
  }

  const buffer = await data.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return { success: true, base64, message: "OK" };
}

