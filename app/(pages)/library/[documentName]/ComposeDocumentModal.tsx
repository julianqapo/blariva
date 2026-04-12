"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, PenLine, Loader2, Bold, Italic, List, AlignLeft, Eye, EyeOff } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (title: string, body: string) => void;
};

// Minimal markdown → HTML renderer (no external dependency)
function renderMarkdown(md: string): string {
  return md
    // Headings
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold + Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // Inline code
    .replace(/`(.+?)`/g, "<code>$1</code>")
    // Unordered list items
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // Wrap consecutive <li> blocks in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    // Blockquote
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Horizontal rule
    .replace(/^---$/gm, "<hr>")
    // Paragraphs — blank line separated blocks that aren't already HTML
    .split(/\n{2,}/)
    .map((block) =>
      block.startsWith("<") ? block : `<p>${block.replace(/\n/g, "<br>")}</p>`
    )
    .join("\n");
}

export default function ComposeDocumentModal({ open, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [preview, setPreview] = useState(false); // ← new
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open) {
      setTitle("");
      setBody("");
      setError("");
      setLoading(false);
      setPreview(false);
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, loading, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle) { setError("Document title is required."); return; }
    if (trimmedTitle.length < 2) { setError("Title must be at least 2 characters."); return; }
    if (!trimmedBody) { setError("Document content cannot be empty."); return; }
    setLoading(true);
    setError("");
    try {
      await new Promise((res) => setTimeout(res, 700));
      onSave?.(trimmedTitle, trimmedBody);
      onClose();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function wrapSelection(before: string, after = before) {
    const ta = document.getElementById("compose-body") as HTMLTextAreaElement;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = body.slice(start, end);
    setBody(body.slice(0, start) + before + selected + after + body.slice(end));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9999, background: "rgba(2, 6, 23, 0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div
        className="animate-fade-in-up w-full flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          maxWidth: 860,
          height: "min(90vh, 700px)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="icon-wrap" style={{ width: 36, height: 36, borderRadius: 9 }}>
              <PenLine size={15} className="text-amber-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base leading-none mb-0.5">
                Write Document
              </h2>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Compose and save a new document to this container
              </p>
            </div>
          </div>
          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            aria-label="Close modal"
            className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
            style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex flex-col gap-4 px-6 pt-5 pb-4 flex-1 min-h-0 overflow-y-auto">

            {error && (
              <div
                className="flex items-start gap-2.5 p-3 rounded-xl text-sm font-medium shrink-0"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171",
                }}
              >
                {error}
              </div>
            )}

            {/* Title */}
            <div className="shrink-0">
              <label className="auth-label">
                Document Title <span style={{ color: "#f87171" }}>*</span>
              </label>
              <input
                ref={titleRef}
                type="text"
                className="auth-input"
                placeholder="e.g. Q1 Compliance Checklist"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(""); }}
                maxLength={120}
                disabled={loading}
                required
              />
            </div>

            {/* Content area */}
            <div className="flex flex-col flex-1 min-h-0">

              {/* Toolbar row */}
              <div className="flex items-center justify-between mb-1.5 shrink-0">
                <label className="auth-label mb-0">
                  Content <span style={{ color: "#f87171" }}>*</span>
                </label>

                <div className="flex items-center gap-2">
                  {/* Markdown toolbar — hidden in preview mode */}
                  {!preview && (
                    <div
                      className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                    >
                      {[
                        { icon: <Bold size={13} />,      label: "Bold",    action: () => wrapSelection("**") },
                        { icon: <Italic size={13} />,    label: "Italic",  action: () => wrapSelection("_") },
                        { icon: <List size={13} />,      label: "List",    action: () => wrapSelection("- ", "") },
                        { icon: <AlignLeft size={13} />, label: "Heading", action: () => wrapSelection("## ", "") },
                      ].map(({ icon, label, action }) => (
                        <button
                          key={label}
                          type="button"
                          title={label}
                          onClick={action}
                          disabled={loading}
                          className="w-7 h-7 flex items-center justify-center rounded transition-colors disabled:opacity-40"
                          style={{ color: "var(--muted)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(245,158,11,0.1)";
                            e.currentTarget.style.color = "var(--primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--muted)";
                          }}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Preview toggle button */}
                  <button
                    type="button"
                    onClick={() => setPreview((p) => !p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: preview ? "rgba(245,158,11,0.12)" : "var(--bg)",
                      border: `1px solid ${preview ? "rgba(245,158,11,0.4)" : "var(--border)"}`,
                      color: preview ? "var(--primary)" : "var(--muted)",
                    }}
                    onMouseEnter={(e) => {
                      if (!preview) {
                        e.currentTarget.style.background = "rgba(245,158,11,0.08)";
                        e.currentTarget.style.color = "var(--primary)";
                        e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!preview) {
                        e.currentTarget.style.background = "var(--bg)";
                        e.currentTarget.style.color = "var(--muted)";
                        e.currentTarget.style.borderColor = "var(--border)";
                      }
                    }}
                  >
                    {preview ? <EyeOff size={13} /> : <Eye size={13} />}
                    {preview ? "Edit" : "Preview"}
                  </button>
                </div>
              </div>

              {/* Editor or Preview */}
              {preview ? (
                <div
                  className="flex-1 min-h-0 overflow-y-auto rounded-xl px-4 py-3"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    minHeight: 160,
                    color: "var(--text)",
                    fontSize: "0.9rem",
                    lineHeight: 1.75,
                  }}
                >
                  {body.trim() ? (
                    <div
                      className="prose-preview"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
                    />
                  ) : (
                    <p style={{ color: "var(--muted)", fontStyle: "italic" }}>
                      Nothing to preview yet. Start writing in the editor.
                    </p>
                  )}
                </div>
              ) : (
                <textarea
                  id="compose-body"
                  className="auth-input resize-none flex-1 min-h-0"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                    minHeight: 160,
                  }}
                  placeholder={"Start writing your document here…\n\nSupports Markdown: **bold**, _italic_, ## headings, - lists"}
                  value={body}
                  onChange={(e) => { setBody(e.target.value); setError(""); }}
                  disabled={loading}
                />
              )}

              <div className="flex items-center justify-end mt-1.5 shrink-0">
                <span className="text-xs" style={{ color: "var(--muted)", opacity: 0.7 }}>
                  {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount} chars
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between gap-3 px-6 py-4 shrink-0"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <p className="text-xs hidden sm:block" style={{ color: "var(--muted)", opacity: 0.6 }}>
              Markdown supported · Saved to current container
            </p>
            <div className="flex items-center gap-3 ml-auto">
              <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center justify-center gap-2 min-w-[140px]"
                disabled={loading || !title.trim() || !body.trim()}
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                  : <><PenLine size={14} /> Save Document</>}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Scoped preview styles */}
      <style>{`
        .prose-preview h1 { font-size: 1.5rem; font-weight: 800; margin: 0.75rem 0 0.5rem; color: var(--text); }
        .prose-preview h2 { font-size: 1.2rem; font-weight: 700; margin: 0.75rem 0 0.4rem; color: var(--text); }
        .prose-preview h3 { font-size: 1rem;   font-weight: 700; margin: 0.5rem 0 0.3rem;  color: var(--text); }
        .prose-preview p  { margin: 0 0 0.75rem; color: var(--text); }
        .prose-preview ul { padding-left: 1.25rem; margin: 0 0 0.75rem; list-style: disc; }
        .prose-preview li { margin-bottom: 0.25rem; color: var(--text); }
        .prose-preview strong { font-weight: 700; color: var(--text); }
        .prose-preview em { font-style: italic; }
        .prose-preview code {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          background: rgba(245,158,11,0.1);
          color: var(--primary);
        }
        .prose-preview blockquote {
          border-left: 3px solid var(--primary);
          padding-left: 0.75rem;
          margin: 0.5rem 0;
          color: var(--muted);
          font-style: italic;
        }
        .prose-preview hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 1rem 0;
        }
      `}</style>
    </div>,
    document.body
  );
}