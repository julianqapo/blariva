// ============================================================
// FILE LOCATION: app/(pages)/library/[documentName]/document_actions.ts
// ============================================================
"use server";

import { createServerSupabaseClient } from "../../../utils/supabase_client";

/**
 * Verifies the current user is authenticated and belongs to the same
 * company as the document at the given storage path.
 * Storage paths are: {id_company}/{id_container}/{document_id}
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

/**
 * Deletes a document via the delete-document edge function.
 * Removes both the storage file and the database row.
 */
export async function deleteDocument(documentId: string) {
  const supabase = createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { success: false, message: "Not authenticated" };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const res = await fetch(`${supabaseUrl}/functions/v1/delete-document`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ document_id: documentId }),
  });

  const data = await res.json();
  return { success: data.success, message: data.message || "" };
}

/**
 * Renames a document via the update_document_name RPC.
 */
export async function renameDocument(documentId: string, newName: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc("update_document_name", {
    p_document_id: documentId,
    p_new_name: newName,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // The RPC returns jsonb: { success, message, data }
  return {
    success: data?.success ?? false,
    message: data?.message ?? "Unknown error",
    data: data?.data ?? null,
  };
}

/**
 * Appends change snippets to a file in storage at:
 *   update/{company_id}/{container_id}/{document_id}
 * and sets document.id_file_status = 1 (pending) so the
 * LLM processing pipeline knows there are unprocessed changes.
 *
 * If the file doesn't exist yet, it is created.
 * If it already exists, the new snippets are appended.
 */
export async function appendChangeSnippets(
  documentId: string,
  containerId: string,
  snippets: Array<{
    timestamp: string;
    before: string;
    changed: string;
    after: string;
  }>
) {
  if (!snippets.length) {
    return { success: true, message: "No changes to save" };
  }

  const supabase = createServerSupabaseClient();

  // Get user's company
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  const { data: staff, error: staffErr } = await supabase
    .from("staff")
    .select("id_company")
    .eq("id", user.id)
    .single();

  if (staffErr || !staff) {
    return { success: false, message: "Staff record not found" };
  }

  const companyId = staff.id_company;
  const storagePath = `update/${companyId}/${containerId}/${documentId}`;

  // Format the new snippets as delimited text blocks
  const newContent = snippets
    .map((s) => {
      const lines: string[] = [];
      lines.push(`--- CHANGE ${s.timestamp} ---`);
      lines.push(`BEFORE: ${s.before}`);
      lines.push(`CHANGED: ${s.changed}`);
      lines.push(`AFTER: ${s.after}`);
      lines.push("");
      return lines.join("\n");
    })
    .join("\n");

  // Try to download the existing file first to append
  let existingContent = "";
  const { data: urlData } = await supabase.storage
    .from("document")
    .createSignedUrl(storagePath, 60);

  if (urlData?.signedUrl) {
    try {
      const res = await fetch(`${urlData.signedUrl}&t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        existingContent = await res.text();
      }
    } catch {
      // File doesn't exist yet — that's fine
    }
  }

  const fullContent = existingContent
    ? `${existingContent}\n${newContent}`
    : newContent;

  // Upload (upsert) the combined content
  const blob = new Blob([fullContent], { type: "text/plain" });
  const { error: uploadErr } = await supabase.storage
    .from("document")
    .upload(storagePath, blob, {
      contentType: "text/plain",
      upsert: true,
    });

  if (uploadErr) {
    return {
      success: false,
      message: `Failed to save change log: ${uploadErr.message}`,
    };
  }

  // Set document status to 1 (pending) so the LLM pipeline picks it up
  const { error: statusErr } = await supabase
    .from("document")
    .update({ id_file_status: 1 })
    .eq("id", documentId)
    .eq("id_company", companyId);

  if (statusErr) {
    return {
      success: false,
      message: `Change log saved, but failed to update status: ${statusErr.message}`,
    };
  }

  return { success: true, message: "Change log saved" };
}
