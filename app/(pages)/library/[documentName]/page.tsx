"use client";

import { useState } from "react";
import {
  Plus, Upload, PenLine, ArrowLeft, Search, File, FileText
} from "lucide-react";
import Link from "next/link";
import ComposeDocumentModal from "./ComposeDocumentModal";

export default function ContainerDetail({ params }: { params: { name: string } }) {
  const containerName = decodeURIComponent(params.name);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  return (
    <div className="page-body animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            className="p-2 rounded-xl transition-colors"
            style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display font-black text-3xl">{containerName}</h1>
            <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Workspace Documents
            </p>
          </div>
        </div>

        {/* Action area */}
        <div className="flex items-center gap-3 mr-2">
          <span
            className="text-xs font-bold uppercase tracking-widest hidden sm:block"
            style={{ color: "var(--muted)" }}
          >
            Add Document
          </span>

          {/* Dropdown anchor */}
          <div className="relative group z-40">
            {/* Plus trigger */}
            <div
              className="w-11 h-11 flex items-center justify-center rounded-xl shadow-lg cursor-default relative z-50"
              style={{
                background: "var(--primary)",
                color: "var(--primary-text)",
              }}
            >
              <Plus
                size={20}
                strokeWidth={3}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </div>

            {/* Dropdown — anchored RIGHT so it never clips */}
            <div
              className="absolute top-0 right-0 w-48 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out max-h-11 group-hover:max-h-40 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Spacer clears the Plus button */}
              <div className="h-11 w-full" />

              <div className="p-2 space-y-1">
                {/* Upload */}
                <label
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-bold transition-all whitespace-nowrap"
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
                  <Upload size={16} />
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap text-left"
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
                  <PenLine size={16} />
                  <span>Write Directly</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and stats row */}
      <div
        className="flex items-center justify-between mb-8 gap-4 p-4 rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--muted)" }}
          />
          <input
            type="text"
            placeholder="Search documents..."
            className="auth-input"
            style={{ paddingLeft: "2.25rem", height: "2.5rem" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <FileText size={14} style={{ color: "var(--muted)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--muted)" }}>
            0 Documents
          </span>
        </div>
      </div>

      {/* Empty state */}
      <div
        className="flex flex-col items-center justify-center py-32 rounded-3xl border-2 border-dashed"
        style={{ borderColor: "var(--border)" }}
      >
        <File size={48} className="mb-4" style={{ color: "var(--border)" }} />
        <p className="font-bold" style={{ color: "var(--muted)" }}>
          This container is empty
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--muted)", opacity: 0.6 }}>
          Hover the + icon to reveal options.
        </p>
      </div>

      <ComposeDocumentModal
        open={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  );
}