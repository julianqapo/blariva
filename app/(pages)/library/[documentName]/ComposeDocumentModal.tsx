"use client";

import { useEffect, useRef, useState } from "react";
import { X, PenLine, Loader2, Bold, Italic, List, AlignLeft } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (title: string, body: string) => void;
};

export default function ComposeDocumentModal({ open, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setTitle("");
      setBody("");
      setError("");
      setLoading(false);
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, loading, onClose]);

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
      // Replace with your actual server action
      await new Promise((res) => setTimeout(res, 700));
      onSave?.(trimmedTitle, trimmedBody);
      onClose();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Toolbar helper — wraps selected textarea text
  function wrapSelection(before: string, after = before) {
    const ta = document.getElementById("compose-body") as HTMLTextAreaElement;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = body.slice(start, end);
    const newBody =
      body.slice(0, start) + before + selected + after + body.slice(end);
    setBody(newBody);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }

  if (!open) return null;

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2, 6, 23, 0.7)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div
        className="animate-fade-in-up w-full flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          maxWidth: 680,
          maxHeight: "90vh",
        }}
      >
        {/* ── Header ── */}
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

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex flex-col gap-4 px-6 pt-5 pb-4 flex-1 overflow-y-auto">

            {/* Error banner */}
            {error && (
              <div
                className="flex items-start gap-2.5 p-3 rounded-xl text-sm font-medium animate-fade-in-up"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171",
                }}
              >
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Title */}
            <div>
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

            {/* Body editor */}
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="auth-label mb-0">Content <span style={{ color: "#f87171" }}>*</span></label>

                {/* Mini toolbar */}
                <div
                  className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                >
                  {[
                    { icon: <Bold size={13} />, label: "Bold", action: () => wrapSelection("**") },
                    { icon: <Italic size={13} />, label: "Italic", action: () => wrapSelection("_") },
                    { icon: <List size={13} />, label: "List item", action: () => wrapSelection("- ", "") },
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
              </div>

              <textarea
                id="compose-body"
                className="auth-input resize-none flex-1"
                style={{
                  minHeight: 220,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.875rem",
                  lineHeight: 1.7,
                }}
                placeholder="Start writing your document here…&#10;&#10;Supports basic Markdown: **bold**, _italic_, ## headings, - lists"
                value={body}
                onChange={(e) => { setBody(e.target.value); setError(""); }}
                disabled={loading}
              />

              {/* Word / char count */}
              <div className="flex items-center justify-end gap-3 mt-1.5">
                <span className="text-xs" style={{ color: "var(--muted)", opacity: 0.7 }}>
                  {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount} chars
                </span>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div
            className="flex items-center justify-between gap-3 px-6 py-4 shrink-0"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <p className="text-xs hidden sm:block" style={{ color: "var(--muted)", opacity: 0.6 }}>
              Markdown supported · Saved to current container
            </p>
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost"
                disabled={loading}
              >
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
    </div>
  );
}