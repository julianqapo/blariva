// ============================================================
// FILE LOCATION: app/(pages)/library/[documentName]/document_actions.ts
// ============================================================
"use server";

import { createServerSupabaseClient } from "../../../utils/supabase_client";

/**
 * Verifies the current user is authenticated and belongs to the same
 * company as the document at the given storage path.
 * Storage paths are: {id_company}/{id_container}/{filename}
 */
async function verifyAccess(supabase: ReturnType<typeof createServerSupabaseClient>, path: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, message: "Not authenticated" };
  }

  // Get the user's company
  const { data: staff, error: staffErr } = await supabase
    .from("staff")
    .select("id_company")
    .eq("id", user.id)
    .single();

  if (staffErr || !staff) {
    return { allowed: false, message: "Staff record not found" };
  }

  // The storage path starts with the company ID
  const pathCompanyId = path.split("/")[0];
  if (staff.id_company !== pathCompanyId) {
    return { allowed: false, message: "Access denied" };
  }

  return { allowed: true, message: "OK" };
}

/**
 * Fetches all documents belonging to a container.
 * RLS on the document table already filters by company,
 * so this only returns docs the user is allowed to see.
 */
export async function fetchDocumentsByContainer(containerId: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("document")
    .select("id, name, path, file_size, id_file_status, created_at, updated_at")
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
 * Downloads a file and returns it as a base64 string.
 * Works for ALL file types (PDF, Word, images, etc).
 * Verifies auth + company match before returning data.
 * Uses a signed URL with cache-busting to always get the latest version.
 */
export async function getFileBase64(path: string) {
  const supabase = createServerSupabaseClient();

  const access = await verifyAccess(supabase, path);
  if (!access.allowed) {
    return { success: false, base64: "", contentType: "", message: access.message };
  }

  // Use signed URL + cache-bust to bypass CDN/storage cache
  const { data: urlData, error: urlError } = await supabase.storage
    .from("document")
    .createSignedUrl(path, 60); // 1 minute is enough for a download

  if (urlError || !urlData?.signedUrl) {
    return { success: false, base64: "", contentType: "", message: urlError?.message || "Failed to create download URL" };
  }

  const cacheBustUrl = `${urlData.signedUrl}&t=${Date.now()}`;
  const res = await fetch(cacheBustUrl, { cache: "no-store" });

  if (!res.ok) {
    return { success: false, base64: "", contentType: "", message: "Failed to download file" };
  }

  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const contentType = res.headers.get("content-type") || "";
  return { success: true, base64, contentType, message: "OK" };
}

/**
 * Downloads a text-based file and returns its content as a string.
 * Verifies auth + company match before returning data.
 * Uses a signed URL with cache-busting to always get the latest version.
 */
export async function getTextFileContent(path: string) {
  const supabase = createServerSupabaseClient();

  const access = await verifyAccess(supabase, path);
  if (!access.allowed) {
    return { success: false, content: "", message: access.message };
  }

  // Use signed URL + cache-bust to bypass CDN/storage cache
  const { data: urlData, error: urlError } = await supabase.storage
    .from("document")
    .createSignedUrl(path, 60);

  if (urlError || !urlData?.signedUrl) {
    return { success: false, content: "", message: urlError?.message || "Failed to create download URL" };
  }

  const cacheBustUrl = `${urlData.signedUrl}&t=${Date.now()}`;
  const res = await fetch(cacheBustUrl, { cache: "no-store" });

  if (!res.ok) {
    return { success: false, content: "", message: "Failed to download file" };
  }

  const text = await res.text();
  return { success: true, content: text, message: "OK" };
}

/**
 * Creates a signed URL for a file in the document bucket.
 * Verifies auth + company match before creating URL.
 */
export async function getSignedUrl(path: string) {
  const supabase = createServerSupabaseClient();

  const access = await verifyAccess(supabase, path);
  if (!access.allowed) {
    return { success: false, url: "", message: access.message };
  }

  const { data, error } = await supabase.storage
    .from("document")
    .createSignedUrl(path, 3600); // 1 hour

  if (error || !data?.signedUrl) {
    return { success: false, url: "", message: error?.message || "Failed to create signed URL" };
  }

  return { success: true, url: data.signedUrl, message: "OK" };
}
