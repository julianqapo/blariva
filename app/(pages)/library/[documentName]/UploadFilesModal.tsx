"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  X,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  Trash2,
} from "lucide-react";
import { createBrowserSupabaseClient } from "../../../utils/supabase_browser";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  containerId: string;
};

type FileEntry = {
  file: File;
  id: string;
  status: "queued" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  documentId?: string;
};

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/x-markdown",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".md", ".png", ".jpeg", ".jpg"];

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon size={16} className="text-blue-400" />;
  if (type === "application/pdf") return <FileText size={16} className="text-red-400" />;
  if (type.includes("word")) return <FileText size={16} className="text-blue-500" />;
  if (type === "text/plain") return <FileText size={16} className="text-gray-400" />;
  return <FileIcon size={16} style={{ color: "var(--muted)" }} />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export default function UploadFilesModal({ open, onClose, onSuccess, containerId }: Props) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setFiles([]);
      setIsUploading(false);
      setGlobalError("");
      setDragOver(false);
    }
  }, [open]);

  // Escape to close (only if not uploading)
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isUploading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, isUploading, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setGlobalError("");
      const entries: FileEntry[] = [];
      const rejected: string[] = [];

      Array.from(newFiles).forEach((file) => {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
          rejected.push(file.name);
          return;
        }
        entries.push({
          file,
          id: generateId(),
          status: "queued",
          progress: 0,
        });
      });

      if (rejected.length > 0) {
        setGlobalError(
          `Skipped ${rejected.length} file(s) with unsupported types: ${rejected.join(", ")}`
        );
      }

      setFiles((prev) => [...prev, ...entries]);
    },
    []
  );

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  async function handleUploadAll() {
    const queuedFiles = files.filter((f) => f.status === "queued");
    if (queuedFiles.length === 0) return;

    setIsUploading(true);
    setGlobalError("");

    const supabase = createBrowserSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setGlobalError("You must be logged in to upload files.");
      setIsUploading(false);
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let anySuccess = false;

    // Upload files one by one so we get individual progress
    for (const entry of queuedFiles) {
      // Mark as uploading
      setFiles((prev) =>
        prev.map((f) => (f.id === entry.id ? { ...f, status: "uploading" as const, progress: 0 } : f))
      );

      try {
        const result = await uploadSingleFile(
          `${supabaseUrl}/functions/v1/upload-documents`,
          session.access_token,
          containerId,
          entry.file,
          (progress) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === entry.id ? { ...f, progress } : f))
            );
          }
        );

        if (result.success) {
          anySuccess = true;
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id
                ? { ...f, status: "done" as const, progress: 100, documentId: result.documentId }
                : f
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id
                ? { ...f, status: "error" as const, progress: 0, error: result.error }
                : f
            )
          );
        }
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? {
                  ...f,
                  status: "error" as const,
                  progress: 0,
                  error: err instanceof Error ? err.message : "Upload failed",
                }
              : f
          )
        );
      }
    }

    setIsUploading(false);
    if (anySuccess) {
      onSuccess();
    }
  }

  if (!open) return null;

  const queuedCount = files.filter((f) => f.status === "queued").length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const uploadingFile = files.find((f) => f.status === "uploading");

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{
          zIndex: 9999,
          background: "rgba(2, 6, 23, 0.75)",
          backdropFilter: "blur(6px)",
        }}
        onClick={(e) => e.target === e.currentTarget && !isUploading && onClose()}
      >
        <div
          className="animate-fade-in-up w-full flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            maxWidth: 620,
            maxHeight: "min(85vh, 660px)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="icon-wrap"
                style={{ width: 36, height: 36, borderRadius: 9 }}
              >
                <Upload size={15} className="text-amber-500" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base leading-none mb-0.5">
                  Upload Files
                </h2>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  PDF, Word, TXT, PNG, JPEG
                </p>
              </div>
            </div>
            <button
              onClick={() => !isUploading && onClose()}
              disabled={isUploading}
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-0">
            {/* Drop zone */}
            {!isUploading && (
              <div
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 px-4 transition-all duration-200 cursor-pointer ${
                  dragOver ? "scale-[1.01]" : ""
                }`}
                style={{
                  borderColor: dragOver ? "var(--primary)" : "var(--border)",
                  background: dragOver ? "rgba(245,158,11,0.04)" : "transparent",
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Upload
                    size={20}
                    style={{
                      color: dragOver ? "var(--primary)" : "var(--muted)",
                    }}
                  />
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Drop files here or click to browse
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  PDF, Word, TXT, PNG, JPEG up to 50 MB each
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpeg,.jpg"
                  onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
            )}

            {/* Global error */}
            {globalError && (
              <div
                className="flex items-start gap-2 p-3 rounded-xl text-sm font-medium animate-fade-in-up"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#f87171",
                }}
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">{globalError}</p>
              </div>
            )}

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--muted)" }}
                  >
                    {files.length} file{files.length !== 1 ? "s" : ""} selected
                  </span>
                  {doneCount > 0 && (
                    <span className="text-xs font-semibold text-green-500">
                      {doneCount} uploaded
                    </span>
                  )}
                </div>

                {files.map((entry) => (
                  <FileRow
                    key={entry.id}
                    entry={entry}
                    onRemove={() => removeFile(entry.id)}
                    isUploading={isUploading}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
              {isUploading && uploadingFile && (
                <span className="flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin text-amber-500" />
                  Uploading {uploadingFile.file.name}...
                </span>
              )}
              {!isUploading && doneCount > 0 && errorCount === 0 && (
                <span className="flex items-center gap-1.5 text-green-500 font-semibold">
                  <CheckCircle2 size={13} />
                  All files uploaded
                </span>
              )}
              {!isUploading && errorCount > 0 && (
                <span className="flex items-center gap-1.5 text-red-400 font-semibold">
                  <XCircle size={13} />
                  {errorCount} failed
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost"
                disabled={isUploading}
              >
                {doneCount > 0 && queuedCount === 0 ? "Close" : "Cancel"}
              </button>
              {queuedCount > 0 && (
                <button
                  type="button"
                  onClick={handleUploadAll}
                  className="btn-primary flex items-center justify-center gap-2 min-w-[140px]"
                  disabled={isUploading || queuedCount === 0}
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <Upload size={14} /> Upload {queuedCount} File
                      {queuedCount !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────── Individual file row ───────── */

function FileRow({
  entry,
  onRemove,
  isUploading,
}: {
  entry: FileEntry;
  onRemove: () => void;
  isUploading: boolean;
}) {
  const statusColor =
    entry.status === "done"
      ? "#22c55e"
      : entry.status === "error"
      ? "#ef4444"
      : entry.status === "uploading"
      ? "var(--primary)"
      : "var(--muted)";

  return (
    <div
      className="relative rounded-xl overflow-hidden transition-all"
      style={{
        background: "var(--bg)",
        border: `1px solid ${
          entry.status === "error"
            ? "rgba(239,68,68,0.3)"
            : entry.status === "done"
            ? "rgba(34,197,94,0.2)"
            : "var(--border)"
        }`,
      }}
    >
      {/* Progress bar background */}
      {entry.status === "uploading" && (
        <div
          className="absolute inset-0 transition-all duration-300 ease-out"
          style={{
            width: `${entry.progress}%`,
            background: "rgba(245,158,11,0.06)",
          }}
        />
      )}

      <div className="relative flex items-center gap-3 px-4 py-3">
        {/* Icon */}
        <div className="shrink-0">{getFileIcon(entry.file.type)}</div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--text)" }}
          >
            {entry.file.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              {formatFileSize(entry.file.size)}
            </span>
            {entry.status === "uploading" && (
              <span
                className="text-xs font-bold tabular-nums"
                style={{ color: "var(--primary)" }}
              >
                {entry.progress}%
              </span>
            )}
            {entry.status === "error" && entry.error && (
              <span className="text-xs text-red-400 truncate max-w-[200px]">
                {entry.error}
              </span>
            )}
          </div>
        </div>

        {/* Status / Remove */}
        <div className="shrink-0 flex items-center gap-2">
          {entry.status === "uploading" && (
            <Loader2
              size={16}
              className="animate-spin"
              style={{ color: "var(--primary)" }}
            />
          )}
          {entry.status === "done" && (
            <CheckCircle2 size={16} className="text-green-500" />
          )}
          {entry.status === "error" && (
            <XCircle size={16} className="text-red-400" />
          )}
          {entry.status === "queued" && !isUploading && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 rounded-lg transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "#ef4444")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--muted)")
              }
              aria-label="Remove file"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar line */}
      {entry.status === "uploading" && (
        <div className="h-0.5 w-full" style={{ background: "var(--border)" }}>
          <div
            className="h-full transition-all duration-300 ease-out rounded-r-full"
            style={{
              width: `${entry.progress}%`,
              background: "var(--primary)",
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ───────── Upload helper with XHR for progress tracking ───────── */

function uploadSingleFile(
  url: string,
  accessToken: string,
  containerId: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<{ success: boolean; documentId?: string; error?: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
          const firstResult = data.results?.[0];
          resolve({
            success: true,
            documentId: firstResult?.document_id,
          });
        } else if (data.results?.[0]?.error) {
          resolve({ success: false, error: data.results[0].error });
        } else {
          resolve({ success: false, error: data.message || "Upload failed" });
        }
      } catch {
        resolve({ success: false, error: "Invalid server response" });
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled"));
    });

    const formData = new FormData();
    formData.append("id_container", containerId);
    formData.append("files", file);

    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.send(formData);
  });
}
