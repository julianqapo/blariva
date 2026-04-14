// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
// const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// const CORS_HEADERS = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
// };

// Deno.serve(async (req: Request) => {
//   // 1. Handle CORS
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: CORS_HEADERS });
//   }

//   if (req.method !== "POST") {
//     return new Response(
//       JSON.stringify({ success: false, message: "Method not allowed" }),
//       { status: 405, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
//     );
//   }

//   try {
//     // ── Auth: Get the user from the JWT ──
//     const authHeader = req.headers.get("Authorization") ?? "";
//     const token = authHeader.replace("Bearer ", "");

//     const supabaseUser = createClient(supabaseUrl, serviceKey, {
//       global: { headers: { Authorization: `Bearer ${token}` } },
//     });

//     const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
//     if (userErr || !user) {
//       return new Response(
//         JSON.stringify({ success: false, message: "Not authenticated" }),
//         { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
//       );
//     }

//     // ── Get staff record → company ID ──
//     const admin = createClient(supabaseUrl, serviceKey);
//     const { data: staff, error: staffErr } = await admin
//       .from("staff")
//       .select("id_company")
//       .eq("id", user.id)
//       .single();

//     if (staffErr || !staff) {
//       return new Response(
//         JSON.stringify({ success: false, message: "Staff record not found" }),
//         { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
//       );
//     }

//     const companyId = staff.id_company;

//     // ── Parse request body ──
//     const { document_id } = await req.json();

//     if (!document_id) {
//       return new Response(
//         JSON.stringify({ success: false, message: "document_id is required" }),
//         { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
//       );
//     }

//     // ── Fetch the Document & Verify Ownership ──
//     // We check BOTH the id and the id_company to ensure they actually own this file
//     const { data: docData, error: fetchErr } = await admin
//       .from("document")
//       .select("path")
//       .eq("id", document_id)
//       .eq("id_company", companyId) 
//       .single();

//     if (fetchErr || !docData) {
//       return new Response(
//         JSON.stringify({ success: false, message: "Document not found or access denied" }),
//         { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
//       );
//     }

//     // ── Delete the file from Storage FIRST ──
//     // Because you saved the exact UUID path in the DB, we just pass docData.path directly!
//     const { error: storageError } = await admin.storage
//       .from("document")
//       .remove([docData.path]);

//     if (storageError) {
//       return new Response(
//         JSON.stringify({ success: false, message: `Failed to delete file from storage: ${storageError.message}` }),
//         { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
//       );
//     }

//     // ── Delete the database row LAST ──
//     const { error: dbDeleteError } = await admin
//       .from("document")
//       .delete()
//       .eq("id", document_id);

//     if (dbDeleteError) {
//       return new Response(
//         JSON.stringify({ success: false, message: `File deleted, but DB record failed: ${dbDeleteError.message}` }),
//         { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
//       );
//     }

//     // ── Success ──
//     return new Response(
//       JSON.stringify({ success: true, message: "Document permanently deleted." }),
//       { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
//     );

//   } catch (e) {
//     return new Response(
//       JSON.stringify({ success: false, message: `Server error: ${String(e)}` }),
//       { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
//     );
//   }
// });