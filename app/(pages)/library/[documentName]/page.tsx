"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus, Upload, PenLine, Search, FileText, FolderOpen,
  Loader2, File as FileIcon, Image as ImageIcon,
  ArrowUp, ArrowDown,
} from "lucide-react";
import ComposeDocumentModal from "./ComposeDocumentModal";
import UploadFilesModal from "./UploadFilesModal";
import ViewDocumentModal from "./ViewDocumentModal";
import { fetchDocumentsByContainer } from "./document_actions";

type Document = {
  id: string;
  name: string;
  path: string;
  file_size: number;
  id_file_status: number | null;
  created_at: string;
  updated_at: string;
};

type SortKey = "name" | "file_size" | "created_at" | "updated_at" | "status";
type SortDir = "asc" | "desc";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatLocalTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: number | null) {
  switch (status) {
    case 1: return { label: "Pending", color: "var(--muted)", bg: "rgba(148,163,184,0.1)" };
    case 2: return { label: "Processing", color: "var(--primary)", bg: "rgba(245,158,11,0.1)" };
    case 3: return { label: "Ready", color: "#22c55e", bg: "rgba(34,197,94,0.1)" };
    default: return { label: "Unknown", color: "var(--muted)", bg: "rgba(148,163,184,0.1)" };
  }
}

function getStatusSortValue(status: number | null): number {
  return status ?? 0;
}

function getDocIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText size={15} className="text-red-400" />;
  if (ext === "doc" || ext === "docx") return <FileText size={15} className="text-blue-500" />;
  if (ext === "txt") return <FileText size={15} className="text-gray-400" />;
  if (ext === "md" || ext === "markdown") return <FileText size={15} className="text-purple-400" />;
  if (["png", "jpg", "jpeg"].includes(ext || "")) return <ImageIcon size={15} className="text-blue-400" />;
  return <FileIcon size={15} style={{ color: "var(--muted)" }} />;
}

function isViewable(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return ["md", "markdown", "txt", "pdf", "png", "jpg", "jpeg", "doc", "docx"].includes(ext);
}

/* ─────────────── Sort Header Component ─────────────── */
function SortHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onClick,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onClick: (key: SortKey) => void;
  align?: "left" | "center" | "right";
}) {
  const isActive = currentKey === sortKey;
  const alignClass = align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";

  return (
    <button
      onClick={() => onClick(sortKey)}
      className={`flex items-center gap-1 ${alignClass} group transition-colors duration-150`}
      style={{ color: isActive ? "var(--primary)" : "var(--muted)" }}
    >
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      <span className="flex flex-col -space-y-1">
        <ArrowUp
          size={11}
          strokeWidth={2.5}
          className="transition-colors duration-150"
          style={{
            color: isActive && currentDir === "asc" ? "var(--primary)" : "var(--border)",
          }}
        />
        <ArrowDown
          size={11}
          strokeWidth={2.5}
          className="transition-colors duration-150"
          style={{
            color: isActive && currentDir === "desc" ? "var(--primary)" : "var(--border)",
          }}
        />
      </span>
    </button>
  );
}

/* ─────────────── Main Page ─────────────── */
export default function ContainerDetail({ params }: { params: Promise<{ documentName: string }> }) {
  const resolvedParams = use(params);
  const containerName = decodeURIComponent(resolvedParams.documentName);
  const searchParams = useSearchParams();
  const containerId = searchParams.get("id");

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // View document modal
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewRefreshKey, setViewRefreshKey] = useState(0);

  // Edit document
  const [editDocData, setEditDocData] = useState<{
    id: string;
    name: string;
    path: string;
    content: string;
  } | null>(null);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    if (containerId) {
      loadDocuments();
    } else {
      setError("Container ID is missing.");
      setIsLoading(false);
    }
  }, [containerId]);

  async function loadDocuments() {
    if (!containerId) return;
    setIsLoading(true);
    setError("");

    const docsRes = await fetchDocumentsByContainer(containerId);
    if (docsRes.success) {
      setDocuments(docsRes.data);
    } else {
      setError(docsRes.message);
    }

    setIsLoading(false);
  }

  function handleDocumentSaved() {
    loadDocuments();
    setViewRefreshKey((k) => k + 1);
  }

  function handleDocumentClick(doc: Document) {
    if (isViewable(doc.name)) {
      setViewDoc(doc);
      setIsViewOpen(true);
    }
  }

  function handleOpenEditor(docData: { id: string; name: string; path: string; content: string }) {
    setEditDocData(docData);
    setIsComposeOpen(true);
  }

  function handleCloseCompose() {
    setIsComposeOpen(false);
    setEditDocData(null);
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  // Filter + sort
  const sortedDocs = useMemo(() => {
    const filtered = documents.filter((d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "file_size":
          cmp = a.file_size - b.file_size;
          break;
        case "created_at":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "updated_at":
          cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case "status":
          cmp = getStatusSortValue(a.id_file_status) - getStatusSortValue(b.id_file_status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [documents, searchQuery, sortKey, sortDir]);

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      {/* Toolbar row */}
      <div
        className="flex items-center justify-between gap-4 p-3 rounded-2xl mb-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--muted)" }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="auth-input w-full"
            style={{ paddingLeft: "2.25rem", height: "2.25rem", fontSize: "0.875rem" }}
          />
        </div>

        {/* Right side: doc count + add button */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5">
            <FileText size={13} style={{ color: "var(--muted)" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
              {documents.length} Document{documents.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

          {/* Add document dropdown */}
          <div className="flex items-center gap-2.5">
            <span
              className="text-xs font-bold uppercase tracking-widest hidden md:block"
              style={{ color: "var(--muted)" }}
            >
              Add
            </span>

            <div className="relative group z-40">
              <button
                className="w-9 h-9 flex items-center justify-center rounded-xl shadow-md transition-transform duration-200 active:scale-95"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-text)",
                }}
                aria-label="Add document"
              >
                <Plus
                  size={18}
                  strokeWidth={2.5}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </button>

              <div
                className="absolute top-0 right-0 w-44 rounded-xl overflow-hidden shadow-xl
                  transition-all duration-300 ease-in-out
                  max-h-9 group-hover:max-h-36
                  opacity-0 group-hover:opacity-100
                  pointer-events-none group-hover:pointer-events-auto"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="h-9 w-full" />
                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                      text-sm font-medium transition-colors duration-150 whitespace-nowrap text-left"
                    style={{ color: "var(--text)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(245,158,11,0.08)";
                      e.currentTarget.style.color = "var(--primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text)";
                    }}
                  >
                    <Upload size={14} />
                    <span>Upload Files</span>
                  </button>

                  <div className="h-px mx-2" style={{ background: "var(--border)" }} />

                  <button
                    onClick={() => { setEditDocData(null); setIsComposeOpen(true); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                      text-sm font-medium transition-colors duration-150 whitespace-nowrap text-left"
                    style={{ color: "var(--text)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(245,158,11,0.08)";
                      e.currentTarget.style.color = "var(--primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text)";
                    }}
                  >
                    <PenLine size={14} />
                    <span>Write Directly</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading / Error / Empty / Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <Loader2 size={32} className="animate-spin mb-4 text-amber-500" />
          <p className="font-semibold text-sm" style={{ color: "var(--muted)" }}>
            Loading documents...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <p className="font-semibold text-sm text-red-400">{error}</p>
        </div>
      ) : sortedDocs.length === 0 && documents.length === 0 ? (
        /* Empty state */
        <div
          className="flex flex-col items-center justify-center flex-1 rounded-2xl border-2 border-dashed min-h-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <FolderOpen size={26} style={{ color: "var(--muted)" }} />
          </div>

          <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
            No documents yet
          </p>
          <p className="text-xs mt-1 mb-5" style={{ color: "var(--muted)" }}>
            Upload a file or write a document to get started
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.color = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text)";
              }}
            >
              <Upload size={13} />
              Upload
            </button>

            <button
              onClick={() => { setEditDocData(null); setIsComposeOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95"
              style={{
                background: "var(--primary)",
                color: "var(--primary-text)",
              }}
            >
              <PenLine size={13} />
              Write Directly
            </button>
          </div>
        </div>
      ) : (
        /* ─────────────── Documents Table ─────────────── */
        <div
          className="flex-1 overflow-auto min-h-0 rounded-xl"
          style={{ border: "1px solid var(--border)" }}
        >
          <table className="w-full border-collapse" style={{ minWidth: "640px" }}>
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                <th className="text-left px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                  <SortHeader label="Name" sortKey="name" currentKey={sortKey} currentDir={sortDir} onClick={handleSort} />
                </th>
                <th className="text-left px-4 py-3" style={{ borderBottom: "1px solid var(--border)", width: "100px" }}>
                  <SortHeader label="Size" sortKey="file_size" currentKey={sortKey} currentDir={sortDir} onClick={handleSort} />
                </th>
                <th className="text-left px-4 py-3" style={{ borderBottom: "1px solid var(--border)", width: "180px" }}>
                  <SortHeader label="Created" sortKey="created_at" currentKey={sortKey} currentDir={sortDir} onClick={handleSort} />
                </th>
                <th className="text-left px-4 py-3" style={{ borderBottom: "1px solid var(--border)", width: "180px" }}>
                  <SortHeader label="Updated" sortKey="updated_at" currentKey={sortKey} currentDir={sortDir} onClick={handleSort} />
                </th>
                <th className="text-center px-4 py-3" style={{ borderBottom: "1px solid var(--border)", width: "110px" }}>
                  <SortHeader label="Status" sortKey="status" currentKey={sortKey} currentDir={sortDir} onClick={handleSort} align="center" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                      No matching documents
                    </p>
                  </td>
                </tr>
              ) : (
                sortedDocs.map((doc, idx) => {
                  const status = getStatusLabel(doc.id_file_status);
                  const viewable = isViewable(doc.name);
                  return (
                    <tr
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc)}
                      className={`transition-colors duration-150 ${viewable ? "cursor-pointer" : ""}`}
                      style={{
                        borderBottom: idx < sortedDocs.length - 1 ? "1px solid var(--border)" : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (viewable) {
                          e.currentTarget.style.background = "rgba(245,158,11,0.04)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="shrink-0">{getDocIcon(doc.name)}</span>
                          <span
                            className="text-sm font-semibold truncate"
                            style={{ color: "var(--text)" }}
                          >
                            {doc.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          {formatFileSize(doc.file_size)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          {formatLocalTime(doc.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          {formatLocalTime(doc.updated_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={{
                            color: status.color,
                            background: status.bg,
                          }}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {containerId && (
        <>
          <ComposeDocumentModal
            open={isComposeOpen}
            onClose={handleCloseCompose}
            onSuccess={handleDocumentSaved}
            containerId={containerId}
            editDocument={editDocData}
          />

          <UploadFilesModal
            open={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            onSuccess={handleDocumentSaved}
            containerId={containerId}
          />

          <ViewDocumentModal
            open={isViewOpen}
            onClose={() => { setIsViewOpen(false); setViewDoc(null); }}
            onSuccess={handleDocumentSaved}
            onOpenEditor={handleOpenEditor}
            document={viewDoc}
            containerId={containerId}
            refreshKey={viewRefreshKey}
          />
        </>
      )}
    </div>
  );
}
