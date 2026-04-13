"use client";

import { useState } from "react";
import { Plus, Upload, PenLine, Search, File, FileText, FolderOpen } from "lucide-react";
import ComposeDocumentModal from "./ComposeDocumentModal";

export default function ContainerDetail({ params }: { params: { name: string } }) {
  const containerName = decodeURIComponent(params.name);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
              0 Documents
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
                  <label
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer
                      text-sm font-medium transition-colors duration-150 whitespace-nowrap"
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
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => console.log(e.target.files)}
                    />
                  </label>

                  <div className="h-px mx-2" style={{ background: "var(--border)" }} />

                  {/* Write */}
                  <button
                    onClick={() => setIsComposeOpen(true)}
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

      {/* Empty state */}
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

        {/* Quick action buttons in empty state */}
        <div className="flex items-center gap-2">
          <label
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
            <input type="file" multiple className="hidden" onChange={(e) => console.log(e.target.files)} />
          </label>

          <button
            onClick={() => setIsComposeOpen(true)}
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

      <ComposeDocumentModal
        open={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  );
}