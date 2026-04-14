"use client";

import { useEffect, useRef, useState } from "react";
import { X, PenLine, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { renameDocument } from "./document_actions";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  document: {
    id: string;
    name: string;
  } | null;
};

export default function RenameDocumentModal({ open, onClose, onSuccess, document: doc }: Props) {
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && doc) {
      setNewName(doc.name);
      setError("");
      setLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 80);
    }
  }, [open, doc]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, loading]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const trimmedName = newName.trim();
  const isChanged = trimmedName !== doc?.name;
  const canSubmit = trimmedName.length >= 1 && isChanged && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !doc) return;

    setLoading(true);
    setError("");

    try {
      const result = await renameDocument(doc.id, trimmedName);

      if (!result.success) {
        setError(result.message || "Failed to rename document.");
        setLoading(false);
      } else {
        onSuccess();
        onClose();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  if (!open || !doc) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2, 6, 23, 0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div
        className="animate-fade-in-up w-full max-w-md rounded-2xl shadow-2xl flex flex-col"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="icon-wrap shrink-0"
              style={{ width: 36, height: 36, borderRadius: 9 }}
            >
              <PenLine size={15} className="text-amber-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base leading-none mb-0.5">
                Rename Document
              </h2>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Change the name of this document
              </p>
            </div>
          </div>
          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
            style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Current name */}
          <div
            className="flex items-center gap-2.5 p-3 rounded-xl text-xs"
            style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
          >
            <span style={{ color: "var(--muted)" }}>Current name:</span>
            <span className="font-semibold truncate" style={{ color: "var(--text)" }}>
              {doc.name}
            </span>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-sm font-medium animate-fade-in-up"
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

          {/* New name input */}
          <div>
            <label className="auth-label">New name</label>
            <input
              ref={inputRef}
              type="text"
              className="auth-input"
              placeholder="Enter new document name"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setError(""); }}
              disabled={loading}
              maxLength={200}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center justify-center gap-2 min-w-[140px]"
              disabled={!canSubmit}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Renaming…</>
              ) : (
                <><CheckCircle2 size={14} /> Rename</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
