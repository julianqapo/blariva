"use client";

import { useEffect, useRef, useState } from "react";
import { X, Settings, Loader2, AlertCircle, Trash2, AlertTriangle } from "lucide-react";

// Import your server actions directly
import { updateContainer, deleteContainer } from "./container_actions"; 

type Container = {
  id: string;
  name: string;
  description: string;
};

type Props = {
  open: boolean;
  container: Container | null;
  onClose: () => void;
  onSuccess: () => void; // Triggers parent to reload data
};

export default function ManageContainerModal({ open, container, onClose, onSuccess }: Props) {
  // Modal State
  const [mode, setMode] = useState<"edit" | "delete">("edit");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Edit State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Delete State
  const [confirmName, setConfirmName] = useState("");
  const [confirmCheck, setConfirmCheck] = useState(false);

  // Reset state when opened or when the selected container changes
  useEffect(() => {
    if (open && container) {
      setMode("edit");
      setName(container.name);
      setDescription(container.description || "");
      setConfirmName("");
      setConfirmCheck(false);
      setError("");
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, container]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && !loading) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, loading]);

  // --- HANDLE EDIT ---
  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!container) return;
    setError(""); 

    const trimmedName = name.trim();
    if (!trimmedName) { setError("Container name is required."); return; }
    if (trimmedName.length < 2) { setError("Name must be at least 2 characters."); return; }

    setLoading(true);
    try {
      const response = await updateContainer(container.id, trimmedName, description.trim());
      if (!response.success) {
        setError(response.message || "Could not update container.");
        setLoading(false); 
      } else {
        onSuccess();
      }
    } catch (err) {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  }

  // --- HANDLE DELETE ---
  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!container) return;
    setError(""); 

    if (confirmName !== container.name) {
      setError("The container name you typed does not match.");
      return;
    }
    if (!confirmCheck) {
      setError("You must check the confirmation box to proceed.");
      return;
    }

    setLoading(true);
    try {
      const response = await deleteContainer(container.id);
      if (!response.success) {
        setError(response.message || "Could not delete container.");
        setLoading(false); 
      } else {
        onSuccess();
      }
    } catch (err) {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  }

  // Safety return
  if (!open || !container) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2, 6, 23, 0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div
        className="animate-fade-in-up w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="icon-wrap" style={{ width: 36, height: 36, borderRadius: 9 }}>
              <Settings size={16} className="text-amber-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base leading-none mb-0.5">Manage Container</h2>
              <p className="text-xs truncate max-w-[200px]" style={{ color: "var(--muted)" }}>
                {container.name}
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

        {/* Tab Navigation */}
        <div className="flex px-6 pt-4 gap-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <button
            type="button"
            onClick={() => { setMode("edit"); setError(""); }}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
              mode === "edit" ? "border-amber-500 text-amber-500" : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Settings
          </button>
          <button
            type="button"
            onClick={() => { setMode("delete"); setError(""); }}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              mode === "delete" ? "border-red-500 text-red-500" : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <Trash2 size={14} /> Danger Zone
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm font-medium animate-fade-in-up">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* ========================================== */}
        {/* EDIT TAB */}
        {/* ========================================== */}
        {mode === "edit" && (
          <form onSubmit={handleEdit} className="px-6 py-5 space-y-5">
            <div>
              <label className="auth-label">
                Container Name <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                className="auth-input"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                maxLength={80}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="auth-label">Description <span className="opacity-50 font-normal">(Optional)</span></label>
              <textarea
                className="auth-input resize-none"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setError(""); }}
                maxLength={255}
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex items-center justify-center gap-2 min-w-[130px]" disabled={loading}>
                {loading ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {/* ========================================== */}
        {/* DELETE TAB */}
        {/* ========================================== */}
        {mode === "delete" && (
          <form onSubmit={handleDelete} className="px-6 py-5 space-y-5">
            
            {/* Severe Warning Banner */}
            <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2 text-red-500 font-bold">
                <AlertTriangle size={18} />
                <h3>Irreversible Action</h3>
              </div>
              <p className="text-xs leading-relaxed text-red-400/90">
                Deleting this container will <strong>permanently destroy</strong> all collections, documents, and data stored within it. This action cannot be undone.
              </p>
            </div>

            {/* Verification 1: Type the Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                Type <span className="text-white bg-white/10 px-1.5 py-0.5 rounded mx-0.5 select-all">{container.name}</span> to confirm
              </label>
              <input
                type="text"
                className="auth-input border-red-500/20 focus:border-red-500 focus:ring-red-500/20"
                placeholder={container.name}
                value={confirmName}
                onChange={(e) => { setConfirmName(e.target.value); setError(""); }}
                disabled={loading}
                autoComplete="off"
              />
            </div>

            {/* Verification 2: Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  className="peer appearance-none w-5 h-5 rounded border-2 border-slate-600 checked:bg-red-500 checked:border-red-500 transition-colors cursor-pointer disabled:opacity-50"
                  checked={confirmCheck}
                  onChange={(e) => { setConfirmCheck(e.target.checked); setError(""); }}
                  disabled={loading}
                />
                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors leading-snug">
                I understand that this action is permanent and I want to delete this container.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost" disabled={loading}>
                Cancel
              </button>
              <button
                type="submit"
                // Button is disabled until BOTH the name matches and the box is checked
                disabled={loading || confirmName !== container.name || !confirmCheck}
                className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[150px]"
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Deleting…</> : "Delete Container"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}