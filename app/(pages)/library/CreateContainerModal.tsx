"use client";

import { useEffect, useRef, useState } from "react";
import { X, BookOpen, Loader2, AlertCircle, PenLine } from "lucide-react";

import { createContainer, updateContainer } from "./container_actions"; 

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** When set, the modal opens in edit mode with existing values */
  editContainer?: {
    id: string;
    name: string;
    description: string;
  } | null;
};

export default function CreateContainerModal({ open, onClose, onSuccess, editContainer }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!editContainer;

  useEffect(() => {
    if (open) {
      if (editContainer) {
        setName(editContainer.name);
        setDescription(editContainer.description);
      } else {
        setName("");
        setDescription("");
      }
      setError("");
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, editContainer]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && !loading) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); 

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (!trimmedName) { 
      setError("Container name is required."); 
      return; 
    }
    
    if (trimmedName.length < 2) { 
      setError("Name must be at least 2 characters."); 
      return; 
    }

    setLoading(true);

    try {
      if (isEditMode && editContainer) {
        const response = await updateContainer(editContainer.id, trimmedName, trimmedDesc);

        if (!response.success) {
          setError(response.message || "An error occurred while updating the container.");
          setLoading(false);
        } else {
          onSuccess();
        }
      } else {
        const response = await createContainer(trimmedName, trimmedDesc);

        if (!response.success) {
          setError(response.message || "An error occurred while creating the container.");
          setLoading(false); 
        } else {
          onSuccess();
        }
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  }

  if (!open) return null;

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
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="icon-wrap" style={{ width: 36, height: 36, borderRadius: 9 }}>
              {isEditMode
                ? <PenLine size={16} className="text-amber-500" />
                : <BookOpen size={16} className="text-amber-500" />
              }
            </div>
            <div>
              <h2 className="font-display font-bold text-base leading-none mb-0.5">
                {isEditMode ? "Edit Container" : "New Container"}
              </h2>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {isEditMode
                  ? "Update the name or description"
                  : "Organise files into a secure workspace"
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="p-1.5 rounded-lg transition-colors hover:bg-amber-500/10 disabled:opacity-50"
            style={{ color: "var(--muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm font-medium animate-fade-in-up">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <div>
            <label className="auth-label">
              Container Name <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              className="auth-input"
              placeholder="e.g. Legal & Compliance"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              maxLength={80}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="auth-label">
              Description <span className="opacity-50 font-normal">(Optional)</span>
            </label>
            <textarea
              className="auth-input resize-none"
              placeholder="What is this container for?"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError(""); }}
              maxLength={255}
              rows={3}
              disabled={loading}
            />
          </div>

          {!isEditMode && (
            <div
              className="rounded-xl px-4 py-3"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                Containers group related documents together. Members with access
                can search and query all files within a container.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center justify-center gap-2 min-w-[150px]"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> {isEditMode ? "Saving…" : "Creating…"}</>
              ) : (
                isEditMode ? "Save Changes" : "Create Container"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
