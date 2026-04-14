"use client";

import { useEffect, useState } from "react";
import {
  X,
  FileText,
  Loader2,
  AlertCircle,
  PenLine,
  Save,
  Eye,
} from "lucide-react";
import { createBrowserSupabaseClient } from "../../../utils/supabase_browser";

type DocumentRecord = {
  id: string;
  name: string;
  path: string;
  file_size: number;
  id_file_status: number | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenEditor: (doc: { id: string; name: string; path: string; content: string }) => void;
  document: DocumentRecord | null;
  containerId: string;
};

/**
 * Renders simple markdown as styled HTML for display.
 */
function renderMarkdown(md: string): string {
  let html = md;
  // Escape HTML entities
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>');
  // Bold & italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="md-hr">');
  // Unordered lists
  html = html.replace(/(^- .+$(\n|$))+/gm, (block) => {
    const items = block.trim().split("\n").map(line => `<li>${line.replace(/^- /, "")}</li>`).join("");
    return `<ul class="md-ul">${items}</ul>`;
  });
  // Ordered lists
  html = html.replace(/(^\d+\. .+$(\n|$))+/gm, (block) => {
    const items = block.trim().split("\n").map(line => `<li>${line.replace(/^\d+\. /, "")}</li>`).join("");
    return `<ol class="md-ol">${items}</ol>`;
  });
  // Paragraphs
  html = html.split("\n\n").map(block => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (/^<(h[123]|ul|ol|hr|li)/.test(trimmed)) return trimmed;
    return `<p class="md-p">${trimmed.replace(/\n/g, "<br>")}</p>`;
  }).join("");
  return html;
}

export default function ViewDocumentModal({
  open,
  onClose,
  onSuccess,
  onOpenEditor,
  document: doc,
  containerId,
}: Props) {
  const [content, setContent] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const ext = doc?.name.split(".").pop()?.toLowerCase() || "";
  const isMarkdown = ext === "md" || ext === "markdown";
  const isTxt = ext === "txt";
  const isEditable = isMarkdown || isTxt;

  // Fetch file content on open
  useEffect(() => {
    if (open && doc) {
      setIsEditing(false);
      setError("");
      fetchContent();
    }
  }, [open, doc]);

  async function fetchContent() {
    if (!doc) return;
    setIsLoading(true);
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error: dlError } = await supabase.storage
        .from("document")
        .download(doc.path);

      if (dlError || !data) {
        setError("Could not load file content.");
        setIsLoading(false);
        return;
      }

      const text = await data.text();
      setContent(text);
      setEditContent(text);
    } catch {
      setError("Failed to fetch document.");
    }
    setIsLoading(false);
  }

  async function handleSaveTxt() {
    if (!doc) return;
    setIsSaving(true);
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("You must be logged in to save.");
        setIsSaving(false);
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const blob = new Blob([editContent], { type: isTxt ? "text/plain" : "text/markdown" });
      const file = new File([blob], doc.name, { type: isTxt ? "text/plain" : "text/markdown" });

      const formData = new FormData();
      formData.append("id_container", containerId);
      formData.append("files", file);
      formData.append("upsert", "true");

      const res = await fetch(`${supabaseUrl}/functions/v1/upload-documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to save.");
        setIsSaving(false);
        return;
      }

      setContent(editContent);
      setIsEditing(false);
      onSuccess();
    } catch {
      setError("An unexpected error occurred.");
    }
    setIsSaving(false);
  }

  function handleEditMarkdown() {
    if (!doc) return;
    // Close this modal and open the ComposeDocumentModal in edit mode
    onOpenEditor({
      id: doc.id,
      name: doc.name,
      path: doc.path,
      content,
    });
    onClose();
  }

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, isSaving, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open || !doc) return null;

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 9999, background: "rgba(2, 6, 23, 0.75)", backdropFilter: "blur(6px)" }}
        onClick={(e) => e.target === e.currentTarget && !isSaving && onClose()}
      >
        <div
          className="animate-fade-in-up w-full flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            maxWidth: 860,
            height: "min(90vh, 720px)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="icon-wrap shrink-0" style={{ width: 36, height: 36, borderRadius: 9 }}>
                <FileText size={15} className="text-amber-500" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-bold text-base leading-none mb-0.5 truncate">
                  {doc.name}
                </h2>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {isEditing ? "Editing" : "Viewing"} · {ext.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Edit button for editable files */}
              {isEditable && !isEditing && !isLoading && (
                <button
                  onClick={() => {
                    if (isMarkdown) {
                      handleEditMarkdown();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    color: "var(--primary)",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.18)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.1)")}
                >
                  <PenLine size={12} />
                  Edit
                </button>
              )}
              {isEditing && isTxt && (
                <button
                  onClick={() => { setIsEditing(false); setEditContent(content); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
                  disabled={isSaving}
                >
                  <Eye size={12} />
                  Preview
                </button>
              )}

              <button
                onClick={() => !isSaving && onClose()}
                disabled={isSaving}
                aria-label="Close modal"
                className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
                style={{ color: "var(--muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 size={28} className="animate-spin mb-3 text-amber-500" />
                <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                  Loading document...
                </p>
              </div>
            ) : error && !content ? (
              <div className="flex flex-col items-center justify-center h-full px-6">
                <div
                  className="flex items-start gap-2 p-4 rounded-xl text-sm font-medium"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#f87171",
                  }}
                >
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              </div>
            ) : isEditing && isTxt ? (
              /* TXT edit mode */
              <textarea
                className="w-full h-full px-6 py-5 bg-transparent resize-none outline-none"
                style={{
                  color: "var(--text)",
                  fontSize: "0.9375rem",
                  lineHeight: "1.75",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={isSaving}
              />
            ) : isMarkdown ? (
              /* Markdown rendered view */
              <div
                className="px-6 py-5 md-rendered"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            ) : (
              /* Plain text view */
              <pre
                className="px-6 py-5 whitespace-pre-wrap"
                style={{
                  color: "var(--text)",
                  fontSize: "0.9375rem",
                  lineHeight: "1.75",
                  fontFamily: isTxt
                    ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                    : "inherit",
                }}
              >
                {content}
              </pre>
            )}
          </div>

          {/* Footer — only for TXT edit mode */}
          {isEditing && isTxt && (
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {error && (
                <span className="text-xs text-red-400 font-medium">{error}</span>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setEditContent(content); }}
                  className="btn-ghost"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTxt}
                  className="btn-primary flex items-center justify-center gap-2 min-w-[130px]"
                  disabled={isSaving}
                >
                  {isSaving
                    ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                    : <><Save size={14} /> Save Changes</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .md-rendered {
          color: var(--text);
          font-size: 0.9375rem;
          line-height: 1.75;
        }
        .md-rendered .md-h1 {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 0 0.75rem;
          color: var(--text);
        }
        .md-rendered .md-h2 {
          font-size: 1.3rem;
          font-weight: 800;
          margin: 1.25rem 0 0.5rem;
          color: var(--text);
        }
        .md-rendered .md-h3 {
          font-size: 1.05rem;
          font-weight: 700;
          margin: 1rem 0 0.4rem;
          color: var(--text);
        }
        .md-rendered strong { font-weight: 700; }
        .md-rendered em { font-style: italic; }
        .md-rendered .md-p {
          margin-bottom: 0.75rem;
        }
        .md-rendered .md-p:last-child { margin-bottom: 0; }
        .md-rendered .md-ul {
          list-style: disc;
          padding-left: 1.4rem;
          margin-bottom: 0.75rem;
        }
        .md-rendered .md-ol {
          list-style: decimal;
          padding-left: 1.4rem;
          margin-bottom: 0.75rem;
        }
        .md-rendered li { margin-bottom: 0.2rem; }
        .md-rendered .md-hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 1.25rem 0;
        }
      `}</style>
    </>
  );
}
