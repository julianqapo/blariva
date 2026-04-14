"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Upload, PenLine, Search, FileText, FolderOpen, Loader2, File as FileIcon, Image as ImageIcon } from "lucide-react";
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
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusLabel(status: number | null) {
  switch (status) {
    case 1: return { label: "Pending", color: "var(--muted)" };
    case 2: return { label: "Processing", color: "var(--primary)" };
    case 3: return { label: "Ready", color: "#22c55e" };
    default: return { label: "Unknown", color: "var(--muted)" };
  }
}

function getDocIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText size={16} className="text-red-400" />;
  if (ext === "doc" || ext === "docx") return <FileText size={16} className="text-blue-500" />;
  if (ext === "txt") return <FileText size={16} className="text-gray-400" />;
  if (ext === "md" || ext === "markdown") return <FileText size={16} className="text-purple-400" />;
  if (["png", "jpg", "jpeg"].includes(ext || "")) return <ImageIcon size={16} className="text-blue-400" />;
  return <FileIcon size={16} style={{ color: "var(--muted)" }} />;
}

function isViewable(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return ["md", "markdown", "txt"].includes(ext);
}

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

  // Edit document (when opening ComposeDocumentModal in edit mode from ViewDocumentModal)
  const [editDocData, setEditDocData] = useState<{
    id: string;
    name: string;
    path: string;
    content: string;
  } | null>(null);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              {/* Trigger button */}
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

              {/* Dropdown */}
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
                {/* Spacer behind the button */}
                <div className="h-9 w-full" />

                <div className="p-1.5 space-y-0.5">
                  {/* Upload */}
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

                  {/* Write */}
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

      {/* Loading state */}
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
      ) : filteredDocs.length === 0 ? (
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
            {searchQuery ? "No matching documents" : "No documents yet"}
          </p>
          <p className="text-xs mt-1 mb-5" style={{ color: "var(--muted)" }}>
            {searchQuery
              ? "Try a different search term"
              : "Upload a file or write a document to get started"}
          </p>

          {!searchQuery && (
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
          )}
        </div>
      ) : (
        /* Document list */
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {filteredDocs.map((doc) => {
            const status = getStatusLabel(doc.id_file_status);
            const viewable = isViewable(doc.name);
            return (
              <div
                key={doc.id}
                onClick={() => handleDocumentClick(doc)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                  viewable ? "cursor-pointer" : ""
                }`}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  if (viewable) {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.background = "rgba(245,158,11,0.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "var(--surface)";
                }}
              >
                <div className="shrink-0">{getDocIcon(doc.name)}</div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: "var(--text)" }}
                  >
                    {doc.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {formatFileSize(doc.file_size)}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      color: status.color,
                      background:
                        status.color === "#22c55e"
                          ? "rgba(34,197,94,0.1)"
                          : status.color === "var(--primary)"
                          ? "rgba(245,158,11,0.1)"
                          : "rgba(148,163,184,0.1)",
                    }}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {containerId && (
        <>
          <ComposeDocumentModal
            open={isComposeOpen}
            onClose={handleCloseCompose}
            onSuccess={() => loadDocuments()}
            containerId={containerId}
            editDocument={editDocData}
          />

          <UploadFilesModal
            open={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            onSuccess={() => loadDocuments()}
            containerId={containerId}
          />

          <ViewDocumentModal
            open={isViewOpen}
            onClose={() => { setIsViewOpen(false); setViewDoc(null); }}
            onSuccess={() => loadDocuments()}
            onOpenEditor={handleOpenEditor}
            document={viewDoc}
            containerId={containerId}
          />
        </>
      )}
    </div>
  );
}
