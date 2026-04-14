"use client";

import { useEffect, useRef, useState } from "react";
import { X, Trash2, Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { deleteDocument } from "./document_actions";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  document: {
    id: string;
    name: string;
  } | null;
};

export default function DeleteDocumentModal({ open, onClose, onSuccess, document: doc }: Props) {
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const confirmMatch = confirmInput.toLowerCase() === "confirm";
  const canSubmit = confirmMatch && !loading;

  useEffect(() => {
    if (open) {
      setConfirmInput("");
      setError("");
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !doc) return;

    setLoading(true);
    setError("");

    try {
      const result = await deleteDocument(doc.id);

      if (!result.success) {
        setError(result.message || "Failed to delete document.");
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
              className="shrink-0 w-9 h-9 rounded-[9px] flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <Trash2 size={16} className="text-red-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base leading-none mb-0.5">
                Delete Document
              </h2>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 disabled:opacity-50"
            style={{ color: "var(--muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Warning banner */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>
                You are about to delete &ldquo;{doc.name}&rdquo;
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                This will permanently remove the document and its file from storage.
                This action cannot be reversed.
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm font-medium animate-fade-in-up">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* Confirm field */}
          <div>
            <label className="auth-label">
              Type <span className="font-bold" style={{ color: "var(--text)" }}>confirm</span> to delete
            </label>
            <input
              ref={inputRef}
              type="text"
              className="auth-input"
              placeholder="confirm"
              value={confirmInput}
              onChange={(e) => { setConfirmInput(e.target.value); setError(""); }}
              disabled={loading}
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
              className="flex items-center justify-center gap-2 min-w-[150px] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40"
              disabled={!canSubmit}
              style={{
                background: canSubmit ? "rgba(239,68,68,0.9)" : "rgba(239,68,68,0.3)",
                color: "#fff",
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Deleting…</>
              ) : (
                <><Trash2 size={14} /> Delete Document</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
