"use client";

import { useEffect, useRef, useState } from "react";
import {
  X, Settings, Loader2, AlertCircle, Trash2, AlertTriangle,
} from "lucide-react";
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
  onSuccess: () => void;
};

export default function ManageContainerModal({ open, container, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<"edit" | "delete">("edit");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [confirmName, setConfirmName] = useState("");
  const [confirmCheck, setConfirmCheck] = useState(false);

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

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, loading]);

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
    } catch {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  }

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
    } catch {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  }

  if (!open || !container) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2, 6, 23, 0.7)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div
        className="animate-fade-in-up w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >

        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="icon-wrap" style={{ width: 36, height: 36, borderRadius: 9 }}>
              <Settings size={16} className="text-amber-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base leading-none mb-0.5">
                Manage Container
              </h2>
              <p className="text-xs truncate max-w-[220px]" style={{ color: "var(--muted)" }}>
                {container.name}
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

        {/* ── Tab Navigation ── */}
        <div
          className="flex px-6 gap-1 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <button
            type="button"
            onClick={() => { setMode("edit"); setError(""); }}
            className="px-1 pb-3 pt-4 text-sm font-semibold transition-colors border-b-2 mr-3"
            style={{
              borderColor: mode === "edit" ? "var(--primary)" : "transparent",
              color: mode === "edit" ? "var(--primary)" : "var(--muted)",
            }}
          >
            Settings
          </button>
          <button
            type="button"
            onClick={() => { setMode("delete"); setError(""); }}
            className="flex items-center gap-1.5 px-1 pb-3 pt-4 text-sm font-semibold transition-colors border-b-2"
            style={{
              borderColor: mode === "delete" ? "#ef4444" : "transparent",
              color: mode === "delete" ? "#ef4444" : "var(--muted)",
            }}
          >
            <Trash2 size={13} />
            Danger Zone
          </button>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div
            className="mx-6 mt-4 flex items-start gap-2.5 p-3 rounded-xl text-sm font-medium animate-fade-in-up"
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

        {/* ══════════════════════════════════════════
            EDIT TAB
        ══════════════════════════════════════════ */}
        {mode === "edit" && (
          <form onSubmit={handleEdit} className="px-6 py-5 space-y-5">
            <div>
              <label className="auth-label">
                Container Name{" "}
                <span style={{ color: "#f87171" }} className="ml-0.5">*</span>
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
              <label className="auth-label">
                Description{" "}
                <span style={{ color: "var(--muted)", fontWeight: 400 }}>(Optional)</span>
              </label>
              <textarea
                className="auth-input resize-none"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setError(""); }}
                maxLength={255}
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
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
                className="btn-primary flex items-center justify-center gap-2 min-w-[130px]"
                disabled={loading}
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                  : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {/* ══════════════════════════════════════════
            DELETE TAB
        ══════════════════════════════════════════ */}
        {mode === "delete" && (
          <form onSubmit={handleDelete} className="px-6 py-5 space-y-5">

            {/* Warning banner */}
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-2 font-bold text-sm" style={{ color: "#f87171" }}>
                <AlertTriangle size={16} />
                Irreversible Action
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(248,113,113,0.85)" }}>
                Deleting this container will{" "}
                <strong>permanently destroy</strong> all collections, documents,
                and data stored within it. This action cannot be undone.
              </p>
            </div>

            {/* Confirm by typing name */}
            <div>
              <label className="auth-label">
                Type{" "}
                <code
                  className="px-1.5 py-0.5 rounded text-xs select-all"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {container.name}
                </code>{" "}
                to confirm
              </label>
              <input
                type="text"
                className="auth-input"
                style={{
                  borderColor: confirmName && confirmName !== container.name
                    ? "rgba(239,68,68,0.5)"
                    : undefined,
                }}
                placeholder={container.name}
                value={confirmName}
                onChange={(e) => { setConfirmName(e.target.value); setError(""); }}
                disabled={loading}
                autoComplete="off"
              />
            </div>

            {/* Confirm checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  className="peer appearance-none w-5 h-5 rounded cursor-pointer disabled:opacity-50 transition-colors"
                  style={{
                    border: "2px solid var(--border)",
                    background: confirmCheck ? "#ef4444" : "var(--bg)",
                    borderColor: confirmCheck ? "#ef4444" : "var(--border)",
                  }}
                  checked={confirmCheck}
                  onChange={(e) => { setConfirmCheck(e.target.checked); setError(""); }}
                  disabled={loading}
                />
                {confirmCheck && (
                  <svg
                    className="absolute w-3 h-3 pointer-events-none"
                    style={{ color: "#fff" }}
                    fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                className="text-sm leading-snug transition-colors"
                style={{ color: "var(--muted)" }}
              >
                I understand this action is permanent and I want to delete this container.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-1">
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
                disabled={loading || confirmName !== container.name || !confirmCheck}
                className="flex items-center justify-center gap-2 min-w-[150px] px-4 py-2.5 text-sm font-bold text-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "#ef4444",
                  boxShadow: "0 4px 20px rgba(239,68,68,0.25)",
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled)
                    e.currentTarget.style.background = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ef4444";
                }}
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Deleting…</>
                  : <><Trash2 size={15} /> Delete Container</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}