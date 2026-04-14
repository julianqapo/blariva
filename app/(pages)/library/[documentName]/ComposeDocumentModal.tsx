"use client";

import { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { X, PenLine, Loader2, Bold, Italic, List, Heading2, Heading3, ListOrdered, Minus, AlertCircle, CheckCircle2 } from "lucide-react";
import { createBrowserSupabaseClient } from "../../../utils/supabase_browser";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  containerId: string;
  /** When set, the modal opens in edit mode with existing content */
  editDocument?: {
    id: string;
    name: string;
    path: string;
    content: string;
  } | null;
};

/**
 * Converts TipTap HTML to simple Markdown.
 */
function htmlToMarkdown(html: string): string {
  let md = html;
  // Headings
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  // Bold & italic
  md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
  // Lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => {
    return inner.replace(/<li[^>]*><p[^>]*>(.*?)<\/p><\/li>/gi, "- $1\n")
               .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n") + "\n";
  });
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
    let i = 0;
    return inner.replace(/<li[^>]*><p[^>]*>(.*?)<\/p><\/li>/gi, (_m: string, content: string) => `${++i}. ${content}\n`)
               .replace(/<li[^>]*>(.*?)<\/li>/gi, (_m: string, content: string) => `${++i}. ${content}\n`) + "\n";
  });
  // Horizontal rule
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n\n");
  // Paragraphs
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  // Clean up remaining tags
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<[^>]+>/g, "");
  // Clean up whitespace
  md = md.replace(/\n{3,}/g, "\n\n").trim();
  return md;
}

/**
 * Converts simple Markdown back to HTML for TipTap.
 */
function markdownToHtml(md: string): string {
  let html = md;
  // Headings (must be before paragraphs)
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  // Bold & italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr>");
  // Unordered lists
  html = html.replace(/(^- .+$(\n|$))+/gm, (block) => {
    const items = block.trim().split("\n").map(line => `<li><p>${line.replace(/^- /, "")}</p></li>`).join("");
    return `<ul>${items}</ul>`;
  });
  // Ordered lists
  html = html.replace(/(^\d+\. .+$(\n|$))+/gm, (block) => {
    const items = block.trim().split("\n").map(line => `<li><p>${line.replace(/^\d+\. /, "")}</p></li>`).join("");
    return `<ol>${items}</ol>`;
  });
  // Paragraphs: wrap remaining plain lines
  html = html.split("\n\n").map(block => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (/^<(h[23]|ul|ol|hr|li|p)/.test(trimmed)) return trimmed;
    return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
  }).join("");
  return html;
}

export default function ComposeDocumentModal({ open, onClose, onSuccess, containerId, editDocument }: Props) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const isEditMode = !!editDocument;

  // Force re-render on every editor transaction (selection change, content change)
  // so toolbar active states update immediately when clicking/selecting styled text
  const [, setEditorState] = useState(0);
  const forceUpdate = useCallback(() => setEditorState((n) => n + 1), []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your document here…",
      }),
    ],
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setCharCount(text.length);
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
    // Re-render toolbar on every transaction (cursor move, selection, format change)
    onTransaction: () => {
      forceUpdate();
    },
  });

  // Reset / populate on open
  useEffect(() => {
    if (open && editor) {
      setError("");
      setLoading(false);

      if (editDocument) {
        // Edit mode: populate with existing content
        setTitle(editDocument.name.replace(/\.md$/, ""));
        const html = markdownToHtml(editDocument.content);
        editor.commands.setContent(html);
        const text = editor.getText();
        setCharCount(text.length);
        setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      } else {
        // Create mode: clear everything
        setTitle("");
        setWordCount(0);
        setCharCount(0);
        editor.commands.clearContent();
      }

      setTimeout(() => {
        (document.getElementById("doc-title") as HTMLInputElement)?.focus();
      }, 80);
    }
  }, [open, editor, editDocument]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, loading, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const html = editor?.getHTML() ?? "";
    const textContent = editor?.getText().trim() ?? "";

    if (!trimmedTitle) { setError("Document title is required."); return; }
    if (trimmedTitle.length < 2) { setError("Title must be at least 2 characters."); return; }
    if (!textContent) { setError("Document content cannot be empty."); return; }

    setLoading(true);
    setError("");

    try {
      // Convert TipTap HTML to Markdown
      const markdown = htmlToMarkdown(html);
      const fileName = `${trimmedTitle}.md`;

      // Create a File object from the markdown content
      const blob = new Blob([markdown], { type: "text/markdown" });
      const file = new File([blob], fileName, { type: "text/markdown" });

      // Get auth token
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("You must be logged in to save documents.");
        setLoading(false);
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const formData = new FormData();
      formData.append("id_container", containerId);
      formData.append("files", file);

      // If editing, use upsert to overwrite
      if (isEditMode) {
        formData.append("upsert", "true");
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/upload-documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to save document.");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const ToolbarButton = ({
    onClick,
    active = false,
    disabled = false,
    title: tip,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={tip}
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-30"
      style={{
        background: active ? "rgba(245,158,11,0.15)" : "transparent",
        color: active ? "var(--primary)" : "var(--muted)",
        border: active ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(245,158,11,0.08)";
          e.currentTarget.style.color = "var(--primary)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--muted)";
        }
      }}
    >
      {children}
    </button>
  );

  const Divider = () => (
    <div className="w-px h-5 mx-1 shrink-0" style={{ background: "var(--border)" }} />
  );

  return (
    <>
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
            height: "min(90vh, 720px)",
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
                  {isEditMode ? "Edit Document" : "Write Document"}
                </h2>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {isEditMode
                    ? "Edit and save changes to your document"
                    : "Compose and save a new document to this container"}
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
            <div className="flex flex-col gap-0 flex-1 min-h-0">

              {/* Title input */}
              <div className="px-6 pt-5 pb-3 shrink-0">
                <input
                  id="doc-title"
                  type="text"
                  className="w-full bg-transparent border-none outline-none font-display font-black text-2xl placeholder:opacity-30"
                  style={{ color: "var(--text)" }}
                  placeholder="Document title…"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setError(""); }}
                  maxLength={120}
                  disabled={loading || isEditMode}
                  required
                />
              </div>

              {/* Formatting toolbar */}
              <div
                className="flex items-center gap-0.5 px-4 py-2 shrink-0 flex-wrap"
                style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
              >
                <ToolbarButton
                  title="Heading 2"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  active={editor?.isActive("heading", { level: 2 }) ?? false}
                >
                  <Heading2 size={15} />
                </ToolbarButton>

                <ToolbarButton
                  title="Heading 3"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  active={editor?.isActive("heading", { level: 3 }) ?? false}
                >
                  <Heading3 size={15} />
                </ToolbarButton>

                <Divider />

                <ToolbarButton
                  title="Bold"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  active={editor?.isActive("bold") ?? false}
                >
                  <Bold size={15} />
                </ToolbarButton>

                <ToolbarButton
                  title="Italic"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  active={editor?.isActive("italic") ?? false}
                >
                  <Italic size={15} />
                </ToolbarButton>

                <Divider />

                <ToolbarButton
                  title="Bullet list"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  active={editor?.isActive("bulletList") ?? false}
                >
                  <List size={15} />
                </ToolbarButton>

                <ToolbarButton
                  title="Numbered list"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  active={editor?.isActive("orderedList") ?? false}
                >
                  <ListOrdered size={15} />
                </ToolbarButton>

                <Divider />

                <ToolbarButton
                  title="Divider line"
                  onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                >
                  <Minus size={15} />
                </ToolbarButton>
              </div>

              {/* Editor content area */}
              <div
                className="flex-1 min-h-0 overflow-y-auto px-6 py-4 cursor-text"
                onClick={() => editor?.commands.focus()}
              >
                <EditorContent editor={editor} />
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex flex-col gap-3 px-6 py-4 shrink-0"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {/* Error banner */}
              {error && (
                <div
                  className="flex items-start gap-2 p-3 rounded-xl text-sm font-medium animate-fade-in-up"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#f87171",
                  }}
                >
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{error}</p>
                </div>
              )}

              {/* Action row */}
              <div className="flex items-center justify-between gap-3">
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold tabular-nums" style={{ color: "var(--text)" }}>
                      {wordCount}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted)", opacity: 0.6 }}>
                      {wordCount === 1 ? "word" : "words"}
                    </span>
                  </div>
                  <div className="w-px h-3" style={{ background: "var(--border)" }} />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold tabular-nums" style={{ color: "var(--text)" }}>
                      {charCount}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted)", opacity: 0.6 }}>
                      {charCount === 1 ? "char" : "chars"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center justify-center gap-2 min-w-[140px]"
                    disabled={loading}
                  >
                    {loading
                      ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                      : <><PenLine size={14} /> {isEditMode ? "Save Changes" : "Save Document"}</>}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .tiptap-editor {
          outline: none;
          min-height: 240px;
          font-size: 0.9375rem;
          line-height: 1.75;
          color: var(--text);
        }
        .tiptap-editor p { margin-bottom: 0.75rem; }
        .tiptap-editor p:last-child { margin-bottom: 0; }
        .tiptap-editor h2 {
          font-size: 1.3rem; font-weight: 800;
          margin: 1rem 0 0.4rem;
          color: var(--text);
        }
        .tiptap-editor h3 {
          font-size: 1.05rem; font-weight: 700;
          margin: 0.75rem 0 0.3rem;
          color: var(--text);
        }
        .tiptap-editor strong { font-weight: 700; }
        .tiptap-editor em { font-style: italic; }
        .tiptap-editor ul {
          list-style: disc;
          padding-left: 1.4rem;
          margin-bottom: 0.75rem;
        }
        .tiptap-editor ol {
          list-style: decimal;
          padding-left: 1.4rem;
          margin-bottom: 0.75rem;
        }
        .tiptap-editor li { margin-bottom: 0.2rem; }
        .tiptap-editor hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 1rem 0;
        }
        .tiptap-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--muted);
          opacity: 0.5;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </>
  );
}
