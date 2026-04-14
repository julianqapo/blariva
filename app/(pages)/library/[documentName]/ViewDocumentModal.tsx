"use client";

import { useEffect, useState, useCallback } from "react";
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
import {
  getFileBase64,
  getTextFileContent,
  getSignedUrl,
} from "./document_actions";
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
  onOpenEditor: (doc: {
    id: string;
    name: string;
    path: string;
    content: string;
  }) => void;
  document: DocumentRecord | null;
  containerId: string;
  /** Increment this to force the modal to re-fetch content */
  refreshKey?: number;
};

function renderMarkdown(md: string): string {
  let html = md;
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = html.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/^---$/gm, '<hr class="md-hr">');
  html = html.replace(/(^- .+$(\n|$))+/gm, (block) => {
    const items = block
      .trim()
      .split("\n")
      .map((line) => `<li>${line.replace(/^- /, "")}</li>`)
      .join("");
    return `<ul class="md-ul">${items}</ul>`;
  });
  html = html.replace(/(^\d+\. .+$(\n|$))+/gm, (block) => {
    const items = block
      .trim()
      .split("\n")
      .map((line) => `<li>${line.replace(/^\d+\. /, "")}</li>`)
      .join("");
    return `<ol class="md-ol">${items}</ol>`;
  });
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h[123]|ul|ol|hr|li)/.test(trimmed)) return trimmed;
      return `<p class="md-p">${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
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
  refreshKey = 0,
}: Props) {
  const [content, setContent] = useState("");
  const [editContent, setEditContent] = useState("");
  // For PDF: base64 data URL rendered via object tag
  const [pdfDataUrl, setPdfDataUrl] = useState("");
  // For Word: HTML rendered by mammoth
  const [wordHtml, setWordHtml] = useState("");
  // For images: base64 data URL
  const [imageDataUrl, setImageDataUrl] = useState("");
  // For download
  const [downloadUrl, setDownloadUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const ext = getFileExt(doc?.name || "");
  const isMarkdown = ext === "md" || ext === "markdown";
  const isTxt = ext === "txt";
  const isPdf = ext === "pdf";
  const isImage = ["png", "jpg", "jpeg"].includes(ext);
  const isDocx = ext === "docx";
  const isDoc = ext === "doc";
  const isTextBased = isMarkdown || isTxt;
  const isEditable = isMarkdown || isTxt;

  const resetState = useCallback(() => {
    setIsEditing(false);
    setError("");
    setContent("");
    setEditContent("");
    setPdfDataUrl("");
    setWordHtml("");
    setImageDataUrl("");
    setDownloadUrl("");
  }, []);

  // Fetch file content on open — also re-fetches when refreshKey changes
  useEffect(() => {
    if (open && doc) {
      resetState();
      fetchContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, doc?.id, refreshKey]);

  async function fetchContent() {
    if (!doc) return;
    setIsLoading(true);
    setError("");

    try {
      if (isTextBased) {
        const result = await getTextFileContent(doc.path);
        if (!result.success) {
          setError(result.message || "Could not load file content.");
          setIsLoading(false);
          return;
        }
        setContent(result.content);
        setEditContent(result.content);
      } else if (isPdf) {
        // Download as base64 and render with <object> data URL
        const result = await getFileBase64(doc.path);
        if (!result.success) {
          setError(result.message || "Could not load PDF.");
          setIsLoading(false);
          return;
        }
        setPdfDataUrl(`data:application/pdf;base64,${result.base64}`);
        // Also get signed URL for download
        const urlRes = await getSignedUrl(doc.path);
        if (urlRes.success) setDownloadUrl(urlRes.url);
      } else if (isImage) {
        // Download as base64 and render with <img>
        const result = await getFileBase64(doc.path);
        if (!result.success) {
          setError(result.message || "Could not load image.");
          setIsLoading(false);
          return;
        }
        const ct = result.contentType || `image/${ext === "jpg" ? "jpeg" : ext}`;
        setImageDataUrl(`data:${ct};base64,${result.base64}`);
        // Signed URL for download
        const urlRes = await getSignedUrl(doc.path);
        if (urlRes.success) setDownloadUrl(urlRes.url);
      } else if (isDocx) {
        // Download as base64, convert via mammoth.js
        const result = await getFileBase64(doc.path);
        if (!result.success) {
          setError(result.message || "Could not load Word document.");
          setIsLoading(false);
          return;
        }

        try {
          // Base64 → ArrayBuffer
          const binaryStr = atob(result.base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const arrayBuffer = bytes.buffer;

          // mammoth.js — handle CJS default vs named export
          const mammoth = await import("mammoth");
          const lib = mammoth.default || mammoth;
          const mammothResult = await lib.convertToHtml(
            { arrayBuffer },
            {
              convertImage: lib.images.imgElement(function (image: {
                contentType: string;
                readAsBase64String: () => Promise<string>;
              }) {
                return image
                  .readAsBase64String()
                  .then(function (imgBase64: string) {
                    return {
                      src: `data:${image.contentType};base64,${imgBase64}`,
                    };
                  });
              }),
            }
          );
          setWordHtml(mammothResult.value);
        } catch {
          setError(
            "Failed to render Word document. You can download it instead."
          );
        }

        // Signed URL for download
        const urlRes = await getSignedUrl(doc.path);
        if (urlRes.success) setDownloadUrl(urlRes.url);
      } else if (isDoc) {
        // Legacy .doc — download only
        const urlRes = await getSignedUrl(doc.path);
        if (urlRes.success) setDownloadUrl(urlRes.url);
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("You must be logged in to save.");
        setIsSaving(false);
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const mimeType = isTxt ? "text/plain" : "text/markdown";
      const blob = new Blob([editContent], { type: mimeType });
      const file = new File([blob], doc.name, { type: mimeType });

      const formData = new FormData();
      formData.append("id_container", containerId);
      formData.append("files", file);
      formData.append("upsert", "true");
      formData.append("existing_doc_id", doc.id);

      const res = await fetch(
        `${supabaseUrl}/functions/v1/upload-documents`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
        }
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to save.");
        setIsSaving(false);
        return;
      }

      // Immediately update local state so content is fresh
      setContent(editContent);
      setIsEditing(false);
      // Tell parent to refresh the document list
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
    if (!doc) return;
    if (isTextBased && content) {
      const blob = new Blob([content], {
        type: isTxt ? "text/plain" : "text/markdown",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
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
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !doc) return null;

  const hasContent =
    content || pdfDataUrl || wordHtml || imageDataUrl || downloadUrl;
  const canDownload =
    isTextBased ? !!content : !!(downloadUrl || pdfDataUrl || imageDataUrl);

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{
          zIndex: 9999,
          background: "rgba(2, 6, 23, 0.75)",
          backdropFilter: "blur(6px)",
        }}
        onClick={(e) =>
          e.target === e.currentTarget && !isSaving && onClose()
        }
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
              <div
                className="icon-wrap shrink-0"
                style={{ width: 36, height: 36, borderRadius: 9 }}
              >
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
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(245,158,11,0.18)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(245,158,11,0.1)")
                  }
                >
                  <PenLine size={12} />
                  Edit
                </button>
              )}
              {isEditing && isTxt && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(content);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    color: "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                  disabled={isSaving}
                >
                  <Eye size={12} />
                  Preview
                </button>
              )}

              {canDownload && !isLoading && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    color: "var(--primary)",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(245,158,11,0.18)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(245,158,11,0.1)")
                  }
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(245,158,11,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div
            className="flex-1 min-h-0"
            style={{ display: "flex", flexDirection: "column" }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center flex-1">
                <Loader2
                  size={28}
                  className="animate-spin mb-3 text-amber-500"
                />
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--muted)" }}
                >
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
              <textarea
                className="w-full flex-1 px-6 py-5 bg-transparent resize-none outline-none"
                style={{
                  color: "var(--text)",
                  fontSize: "0.9375rem",
                  lineHeight: "1.75",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={isSaving}
              />
            ) : isMarkdown ? (
              <div
                className="px-6 py-5 md-rendered overflow-y-auto flex-1"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            ) : isTxt ? (
              <pre
                className="px-6 py-5 whitespace-pre-wrap overflow-y-auto flex-1"
                style={{
                  color: "var(--text)",
                  fontSize: "0.9375rem",
                  lineHeight: "1.75",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}
              >
                {content}
              </pre>
            ) : isPdf && pdfDataUrl ? (
              <object
                data={pdfDataUrl}
                type="application/pdf"
                className="flex-1 w-full"
                style={{ border: "none" }}
              >
                <div className="flex flex-col items-center justify-center flex-1 p-6">
                  <p
                    className="text-sm mb-3"
                    style={{ color: "var(--muted)" }}
                  >
                    Your browser cannot display this PDF inline.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
                  >
                    <Download size={14} />
                    Download {doc.name}
                  </button>
                </div>
              </object>
            ) : isImage && imageDataUrl ? (
              <div className="flex items-center justify-center flex-1 p-6 overflow-auto">
                <img
                  src={imageDataUrl}
                  alt={doc.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}
                />
              </div>
            ) : isDocx && wordHtml ? (
              <div
                className="px-6 py-5 overflow-y-auto flex-1 word-rendered"
                dangerouslySetInnerHTML={{ __html: wordHtml }}
              />
            ) : isDoc ? (
              <div className="flex flex-col items-center justify-center flex-1 px-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: "rgba(59,130,246,0.1)",
                    border: "1px solid rgba(59,130,246,0.2)",
                  }}
                >
                  <FileText size={28} className="text-blue-500" />
                </div>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "var(--text)" }}
                >
                  Word Document (.doc)
                </p>
                <p
                  className="text-xs mb-4 text-center"
                  style={{ color: "var(--muted)" }}
                >
                  Legacy .doc files cannot be previewed. Use the Download
                  button to open it in Word.
                </p>
                {downloadUrl && (
                  <button
                    onClick={handleDownload}
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
                  >
                    <Download size={14} />
                    Download {doc.name}
                  </button>
                )}
              </div>
            ) : (
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
                <span className="text-xs text-red-400 font-medium">
                  {error}
                </span>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(content);
                  }}
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
                  {isSaving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Save Changes
                    </>
                  )}
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
