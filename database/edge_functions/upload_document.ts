// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import { createClient } from "jsr:@supabase/supabase-js@2";

// const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
// };

// interface UploadResult {
//   file_name: string;
//   success: boolean;
//   document_id?: string;
//   path?: string;
//   error?: string;
// }

// const allowedTypes = [
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "text/plain",
//   "text/markdown",
//   "text/x-markdown",
//   "image/png",
//   "image/jpeg",
//   "image/jpg",
// ];

// const allowedExtensions = [
//   ".pdf", ".doc", ".docx", ".txt", ".md", ".markdown",
//   ".png", ".jpeg", ".jpg",
// ];

// /**
//  * Map file extension to MIME type. This is critical because Deno FormData
//  * often returns an empty string for file.type, causing uploads to fail
//  * when the storage bucket validates MIME types.
//  */
// const extToMime: Record<string, string> = {
//   ".pdf": "application/pdf",
//   ".doc": "application/msword",
//   ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   ".txt": "text/plain",
//   ".md": "text/markdown",
//   ".markdown": "text/markdown",
//   ".png": "image/png",
//   ".jpeg": "image/jpeg",
//   ".jpg": "image/jpeg",
// };

// function getExtension(fileName: string): string {
//   const dot = fileName.lastIndexOf(".");
//   if (dot === -1) return "";
//   return fileName.slice(dot).toLowerCase();
// }

// function isAllowed(file: File): boolean {
//   if (file.type && allowedTypes.includes(file.type)) return true;
//   const ext = getExtension(file.name);
//   return allowedExtensions.includes(ext);
// }

// /**
//  * Determine the correct content type for a file.
//  * Prefer the file's own type if it's valid, otherwise infer from extension.
//  */
// function resolveContentType(file: File): string {
//   // If the browser/client provided a valid MIME type, use it
//   if (file.type && allowedTypes.includes(file.type)) {
//     return file.type;
//   }
//   // Otherwise, infer from extension
//   const ext = getExtension(file.name);
//   return extToMime[ext] || "application/octet-stream";
// }

// Deno.serve(async (req: Request) => {
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }

//   if (req.method !== "POST") {
//     return new Response(
//       JSON.stringify({ success: false, message: "Method not allowed" }),
//       { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//     );
//   }

//   try {
//     const formData = await req.formData();
//     const idContainer = formData.get("id_container") as string | null;
//     // When true, overwrite existing file in storage (used for edits)
//     const upsertMode = formData.get("upsert") === "true";

//     if (!idContainer) {
//       return new Response(
//         JSON.stringify({ success: false, message: "id_container is required" }),
//         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const files: File[] = [];
//     for (const [key, value] of formData.entries()) {
//       if (key === "files" && value instanceof File) {
//         files.push(value);
//       }
//     }

//     if (files.length === 0) {
//       return new Response(
//         JSON.stringify({ success: false, message: "No files provided" }),
//         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     for (const file of files) {
//       if (!isAllowed(file)) {
//         return new Response(
//           JSON.stringify({
//             success: false,
//             message: `File type not allowed: ${file.name} (${file.type}). Allowed: PDF, Word, TXT, Markdown, PNG, JPEG.`,
//           }),
//           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
//     }

//     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

//     const { data: containerData, error: containerError } = await supabase
//       .from("container")
//       .select("id_company")
//       .eq("id", idContainer)
//       .single();

//     if (containerError || !containerData) {
//       return new Response(
//         JSON.stringify({
//           success: false,
//           message: "Container not found or access denied",
//           detail: containerError?.message,
//         }),
//         { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const idCompany = containerData.id_company;
//     const results: UploadResult[] = [];

//     for (const file of files) {
//       const fileName = file.name;
//       const storagePath = `${idCompany}/${idContainer}/${fileName}`;

//       try {
//         const fileBuffer = await file.arrayBuffer();

//         // Use resolveContentType instead of the broken fallback
//         const contentType = resolveContentType(file);

//         const { error: uploadError } = await supabase.storage
//           .from("document")
//           .upload(storagePath, fileBuffer, {
//             contentType,
//             upsert: upsertMode,
//           });

//         if (uploadError) {
//           results.push({ file_name: fileName, success: false, error: uploadError.message });
//           continue;
//         }

//         if (upsertMode) {
//           // For upsert/edit mode, update the existing document record
//           const { data: existingDoc } = await supabase
//             .from("document")
//             .select("id")
//             .eq("path", storagePath)
//             .single();

//           if (existingDoc) {
//             const { error: updateError } = await supabase
//               .from("document")
//               .update({ file_size: file.size, updated_at: new Date().toISOString() })
//               .eq("id", existingDoc.id);

//             if (updateError) {
//               results.push({ file_name: fileName, success: false, error: updateError.message });
//               continue;
//             }

//             results.push({
//               file_name: fileName, success: true, document_id: existingDoc.id, path: storagePath,
//             });
//             continue;
//           }
//         }

//         // Insert new document record
//         const { data: docData, error: docError } = await supabase
//           .from("document")
//           .insert({
//             id_company: idCompany,
//             name: fileName,
//             id_container: idContainer,
//             path: storagePath,
//             file_size: file.size,
//             id_file_status: 1,
//           })
//           .select("id")
//           .single();

//         if (docError) {
//           await supabase.storage.from("document").remove([storagePath]);
//           results.push({ file_name: fileName, success: false, error: docError.message });
//           continue;
//         }

//         results.push({
//           file_name: fileName, success: true, document_id: docData.id, path: storagePath,
//         });
//       } catch (fileErr) {
//         results.push({
//           file_name: fileName,
//           success: false,
//           error: fileErr instanceof Error ? fileErr.message : "Unknown error",
//         });
//       }
//     }

//     const allSuccess = results.every((r) => r.success);
//     const someSuccess = results.some((r) => r.success);

//     return new Response(
//       JSON.stringify({
//         success: allSuccess,
//         partial: !allSuccess && someSuccess,
//         message: allSuccess
//           ? `All ${results.length} file(s) uploaded successfully`
//           : someSuccess
//           ? `${results.filter((r) => r.success).length} of ${results.length} files uploaded`
//           : "All uploads failed",
//         results,
//       }),
//       {
//         status: allSuccess ? 200 : someSuccess ? 207 : 500,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       }
//     );
//   } catch (err) {
//     return new Response(
//       JSON.stringify({
//         success: false,
//         message: "Internal server error",
//         detail: err instanceof Error ? err.message : "Unknown error",
//       }),
//       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//     );
//   }
// });import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import { createClient } from "jsr:@supabase/supabase-js@2";

// const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
// };

// interface UploadResult {
//   file_name: string;
//   success: boolean;
//   document_id?: string;
//   path?: string;
//   error?: string;
// }

// const allowedTypes = [
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "text/plain",
//   "text/markdown",
//   "text/x-markdown",
//   "image/png",
//   "image/jpeg",
//   "image/jpg",
// ];

// const allowedExtensions = [
//   ".pdf", ".doc", ".docx", ".txt", ".md", ".markdown",
//   ".png", ".jpeg", ".jpg",
// ];

// /**
//  * Map file extension to MIME type. This is critical because Deno FormData
//  * often returns an empty string for file.type, causing uploads to fail
//  * when the storage bucket validates MIME types.
//  */
// const extToMime: Record<string, string> = {
//   ".pdf": "application/pdf",
//   ".doc": "application/msword",
//   ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   ".txt": "text/plain",
//   ".md": "text/markdown",
//   ".markdown": "text/markdown",
//   ".png": "image/png",
//   ".jpeg": "image/jpeg",
//   ".jpg": "image/jpeg",
// };

// function getExtension(fileName: string): string {
//   const dot = fileName.lastIndexOf(".");
//   if (dot === -1) return "";
//   return fileName.slice(dot).toLowerCase();
// }

// function isAllowed(file: File): boolean {
//   if (file.type && allowedTypes.includes(file.type)) return true;
//   const ext = getExtension(file.name);
//   return allowedExtensions.includes(ext);
// }

// /**
//  * Determine the correct content type for a file.
//  * Prefer the file's own type if it's valid, otherwise infer from extension.
//  */
// function resolveContentType(file: File): string {
//   // If the browser/client provided a valid MIME type, use it
//   if (file.type && allowedTypes.includes(file.type)) {
//     return file.type;
//   }
//   // Otherwise, infer from extension
//   const ext = getExtension(file.name);
//   return extToMime[ext] || "application/octet-stream";
// }

// Deno.serve(async (req: Request) => {
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }

//   if (req.method !== "POST") {
//     return new Response(
//       JSON.stringify({ success: false, message: "Method not allowed" }),
//       { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//     );
//   }

//   try {
//     const formData = await req.formData();
//     const idContainer = formData.get("id_container") as string | null;
//     // When true, overwrite existing file in storage (used for edits)
//     const upsertMode = formData.get("upsert") === "true";

//     if (!idContainer) {
//       return new Response(
//         JSON.stringify({ success: false, message: "id_container is required" }),
//         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const files: File[] = [];
//     for (const [key, value] of formData.entries()) {
//       if (key === "files" && value instanceof File) {
//         files.push(value);
//       }
//     }

//     if (files.length === 0) {
//       return new Response(
//         JSON.stringify({ success: false, message: "No files provided" }),
//         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     for (const file of files) {
//       if (!isAllowed(file)) {
//         return new Response(
//           JSON.stringify({
//             success: false,
//             message: `File type not allowed: ${file.name} (${file.type}). Allowed: PDF, Word, TXT, Markdown, PNG, JPEG.`,
//           }),
//           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
//     }

//     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

//     const { data: containerData, error: containerError } = await supabase
//       .from("container")
//       .select("id_company")
//       .eq("id", idContainer)
//       .single();

//     if (containerError || !containerData) {
//       return new Response(
//         JSON.stringify({
//           success: false,
//           message: "Container not found or access denied",
//           detail: containerError?.message,
//         }),
//         { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const idCompany = containerData.id_company;
//     const results: UploadResult[] = [];

//     for (const file of files) {
//       const fileName = file.name;
//       const storagePath = `${idCompany}/${idContainer}/${fileName}`;

//       try {
//         const fileBuffer = await file.arrayBuffer();

//         // Use resolveContentType instead of the broken fallback
//         const contentType = resolveContentType(file);

//         const { error: uploadError } = await supabase.storage
//           .from("document")
//           .upload(storagePath, fileBuffer, {
//             contentType,
//             upsert: upsertMode,
//           });

//         if (uploadError) {
//           results.push({ file_name: fileName, success: false, error: uploadError.message });
//           continue;
//         }

//         if (upsertMode) {
//           // For upsert/edit mode, update the existing document record
//           const { data: existingDoc } = await supabase
//             .from("document")
//             .select("id")
//             .eq("path", storagePath)
//             .single();

//           if (existingDoc) {
//             const { error: updateError } = await supabase
//               .from("document")
//               .update({ file_size: file.size, updated_at: new Date().toISOString() })
//               .eq("id", existingDoc.id);

//             if (updateError) {
//               results.push({ file_name: fileName, success: false, error: updateError.message });
//               continue;
//             }

//             results.push({
//               file_name: fileName, success: true, document_id: existingDoc.id, path: storagePath,
//             });
//             continue;
//           }
//         }

//         // Insert new document record
//         const { data: docData, error: docError } = await supabase
//           .from("document")
//           .insert({
//             id_company: idCompany,
//             name: fileName,
//             id_container: idContainer,
//             path: storagePath,
//             file_size: file.size,
//             id_file_status: 1,
//           })
//           .select("id")
//           .single();

//         if (docError) {
//           await supabase.storage.from("document").remove([storagePath]);
//           results.push({ file_name: fileName, success: false, error: docError.message });
//           continue;
//         }

//         results.push({
//           file_name: fileName, success: true, document_id: docData.id, path: storagePath,
//         });
//       } catch (fileErr) {
//         results.push({
//           file_name: fileName,
//           success: false,
//           error: fileErr instanceof Error ? fileErr.message : "Unknown error",
//         });
//       }
//     }

//     const allSuccess = results.every((r) => r.success);
//     const someSuccess = results.some((r) => r.success);

//     return new Response(
//       JSON.stringify({
//         success: allSuccess,
//         partial: !allSuccess && someSuccess,
//         message: allSuccess
//           ? `All ${results.length} file(s) uploaded successfully`
//           : someSuccess
//           ? `${results.filter((r) => r.success).length} of ${results.length} files uploaded`
//           : "All uploads failed",
//         results,
//       }),
//       {
//         status: allSuccess ? 200 : someSuccess ? 207 : 500,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       }
//     );
//   } catch (err) {
//     return new Response(
//       JSON.stringify({
//         success: false,
//         message: "Internal server error",
//         detail: err instanceof Error ? err.message : "Unknown error",
//       }),
//       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//     );
//   }
// });