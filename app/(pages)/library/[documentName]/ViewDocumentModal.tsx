"use client";

import { useEffect, useState, useRef } from "react";
import {
  X,
  FileText,
  Loader2,
  AlertCircle,
  PenLine,
  Save,
  Eye,
  Download,
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
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/^---$/gm, '<hr class="md-hr">');
  html = html.replace(/(^- .+$(\n|$))+/gm, (block) => {
    const items = block.trim().split("\n").map(line => `<li>${line.replace(/^- /, "")}</li>`).join("");
    return `<ul class="md-ul">${items}</ul>`;
  });
  html = html.replace(/(^\d+\. .+$(\n|$))+/gm, (block) => {
    const items = block.trim().split("\n").map(line => `<li>${line.replace(/^\d+\. /, "")}</li>`).join("");
    return `<ol class="md-ol">${items}</ol>`;
  });
  html = html.split("\n\n").map(block => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (/^<(h[123]|ul|ol|hr|li)/.test(trimmed)) return trimmed;
    return `<p class="md-p">${trimmed.replace(/\n/g, "<br>")}</p>`;
  }).join("");
  return html;
}

function getFileExt(name: string): string {
  return name.split(".").pop()?.toLowerCase() || "";
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
  const [blobUrl, setBlobUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [wordHtml, setWordHtml] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const blobUrlRef = useRef("");

  const ext = getFileExt(doc?.name || "");
  const isMarkdown = ext === "md" || ext === "markdown";
  const isTxt = ext === "txt";
  const isPdf = ext === "pdf";
  const isImage = ["png", "jpg", "jpeg"].includes(ext);
  const isDocx = ext === "docx";
  const isDoc = ext === "doc";
  const isWord = isDocx || isDoc;
  const isTextBased = isMarkdown || isTxt;
  const isEditable = isMarkdown || isTxt;

  // Clean up blob URL on unmount/re-fetch
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = "";
      }
    };
  }, []);

  // Fetch file content on open
  useEffect(() => {
    if (open && doc) {
      setIsEditing(false);
      setError("");
      setContent("");
      setBlobUrl("");
      setDownloadUrl("");
      setWordHtml("");

      // Revoke old blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = "";
      }

      fetchContent();
    }
  }, [open, doc]);

  async function fetchContent() {
    if (!doc) return;
    setIsLoading(true);
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();

      if (isTextBased) {
        // For text-based files, download and read as text
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
      } else {
        // For binary files, download the blob directly
        const { data, error: dlError } = await supabase.storage
          .from("document")
          .download(doc.path);

        if (dlError || !data) {
          setError("Could not load file.");
          setIsLoading(false);
          return;
        }

        // Create a download URL from the blob
        const url = URL.createObjectURL(data);
        blobUrlRef.current = url;
        setDownloadUrl(url);

        if (isPdf) {
          // For PDFs, use the blob URL directly in the iframe
          setBlobUrl(url);
        } else if (isImage) {
          // For images, use the blob URL directly
          setBlobUrl(url);
        } else if (isDocx) {
          // For .docx, use mammoth.js to convert to HTML
          try {
            const mammoth = await import("mammoth");
            const arrayBuffer = await data.arrayBuffer();
            const result = await mammoth.default.convertToHtml(
              { arrayBuffer },
              {
                convertImage: mammoth.default.images.imgElement(function (image: { contentType: string; readAsBase64String: () => Promise<string> }) {
                  return image.readAsBase64String().then(function (imageBuffer: string) {
                    return { src: "data:" + image.contentType + ";base64," + imageBuffer };
                  });
                }),
              }
            );
            setWordHtml(result.value);
          } catch {
            setError("Failed to render Word document. You can download it instead.");
          }
        }
        // For .doc (old format), we just show a download prompt
      }
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
    onOpenEditor({
      id: doc.id,
      name: doc.name,
      path: doc.path,
      content,
    });
    onClose();
  }

  function handleDownload() {
    if (!downloadUrl || !doc) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

  const hasContent = content || blobUrl || wordHtml;

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
              {/* Edit button for editable text files */}
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

              {/* Download button for binary files */}
              {(isPdf || isImage || isWord) && downloadUrl && !isLoading && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    color: "var(--primary)",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.18)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.1)")}
                >
                  <Download size={12} />
                  Download
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
          <div className="flex-1 min-h-0" style={{ display: "flex", flexDirection: "column" }}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center flex-1">
                <Loader2 size={28} className="animate-spin mb-3 text-amber-500" />
                <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                  Loading document...
                </p>
              </div>
            ) : error && !hasContent ? (
              <div className="flex flex-col items-center justify-center flex-1 px-6">
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
                className="w-full flex-1 px-6 py-5 bg-transparent resize-none outline-none"
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
                className="px-6 py-5 md-rendered overflow-y-auto flex-1"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            ) : isTxt ? (
              /* Plain text view */
              <pre
                className="px-6 py-5 whitespace-pre-wrap overflow-y-auto flex-1"
                style={{
                  color: "var(--text)",
                  fontSize: "0.9375rem",
                  lineHeight: "1.75",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}
              >
                {content}
              </pre>
            ) : isPdf ? (
              /* PDF viewer — using blob URL in iframe */
              <iframe
                src={blobUrl}
                className="flex-1 w-full"
                style={{ border: "none" }}
                title={doc.name}
              />
            ) : isImage ? (
              /* Image viewer */
              <div className="flex items-center justify-center flex-1 p-6 overflow-auto">
                <img
                  src={blobUrl}
                  alt={doc.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}
                />
              </div>
            ) : isDocx && wordHtml ? (
              /* Word .docx rendered via mammoth.js */
              <div
                className="px-6 py-5 overflow-y-auto flex-1 word-rendered"
                dangerouslySetInnerHTML={{ __html: wordHtml }}
              />
            ) : isDoc ? (
              /* Old .doc format — cannot render, show download prompt */
              <div className="flex flex-col items-center justify-center flex-1 px-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
                >
                  <FileText size={28} className="text-blue-500" />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>
                  Word Document (.doc)
                </p>
                <p className="text-xs mb-4 text-center" style={{ color: "var(--muted)" }}>
                  Legacy .doc files cannot be previewed in the browser. Use the Download button to open it in Word.
                </p>
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                  <Download size={14} />
                  Download {doc.name}
                </button>
              </div>
            ) : (
              /* Fallback */
              <div className="flex flex-col items-center justify-center flex-1 px-6">
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Preview is not available for this file type.
                </p>
              </div>
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

        /* Word document rendered styles */
        .word-rendered {
          color: var(--text);
          font-size: 0.9375rem;
          line-height: 1.75;
        }
        .word-rendered h1 {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 0 0.75rem;
          color: var(--text);
        }
        .word-rendered h2 {
          font-size: 1.3rem;
          font-weight: 800;
          margin: 1.25rem 0 0.5rem;
          color: var(--text);
        }
        .word-rendered h3 {
          font-size: 1.05rem;
          font-weight: 700;
          margin: 1rem 0 0.4rem;
          color: var(--text);
        }
        .word-rendered p {
          margin-bottom: 0.75rem;
        }
        .word-rendered p:last-child { margin-bottom: 0; }
        .word-rendered strong { font-weight: 700; }
        .word-rendered em { font-style: italic; }
        .word-rendered ul {
          list-style: disc;
          padding-left: 1.4rem;
          margin-bottom: 0.75rem;
        }
        .word-rendered ol {
          list-style: decimal;
          padding-left: 1.4rem;
          margin-bottom: 0.75rem;
        }
        .word-rendered li { margin-bottom: 0.2rem; }
        .word-rendered table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }
        .word-rendered th, .word-rendered td {
          border: 1px solid var(--border);
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .word-rendered th {
          background: var(--bg);
          font-weight: 700;
        }
        .word-rendered img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 0.75rem 0;
        }
      `}</style>
    </>
  );
}
