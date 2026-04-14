"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, FolderOpen, Loader2, FileText, ChevronRight } from "lucide-react";
import CreateContainerModal from "./CreateContainerModal";
import { fetchContainers } from "./container_actions";

type Container = {
  id: string;
  name: string;
  description: string;
  counter: number;
};

export default function KnowledgeLibraryPage() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadContainers();
  }, []);

  async function loadContainers() {
    setIsLoading(true);
    const response = await fetchContainers();

    if (response.success) {
      setContainers(response.data);
    } else {
      setError(response.message);
    }
    setIsLoading(false);
  }

  const filtered = containers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-body animate-fade-in-up">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Search containers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="auth-input"
              style={{ padding: "0.6rem 1rem 0.6rem 2.25rem" }}
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              {filtered.length} container{filtered.length !== 1 ? "s" : ""}
            </span>
            <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} />
              New Container
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin mb-4 text-amber-500" />
            <p className="font-semibold text-base" style={{ color: "var(--muted)" }}>Loading workspace...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <FolderOpen size={48} className="mb-4" style={{ color: "var(--border)" }} />
            <p className="font-semibold text-base">No containers found</p>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {search ? "No matches for your search." : "Create your first container to get started."}
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            {/* Table header */}
            <div
              className="grid items-center px-5 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{
                gridTemplateColumns: "1fr 2fr auto auto",
                color: "var(--muted)",
                background: "var(--surface)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span>Name</span>
              <span>Description</span>
              <span className="text-center" style={{ minWidth: "80px" }}>Documents</span>
              <span style={{ width: "32px" }} />
            </div>

            {/* Rows */}
            {filtered.map((col, idx) => (
              <ContainerRow key={col.id} container={col} isLast={idx === filtered.length - 1} />
            ))}
          </div>
        )}
      </div>

      <CreateContainerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          loadContainers();
        }}
      />
    </>
  );
}


function ContainerRow({ container, isLast }: { container: Container; isLast: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/library/${encodeURIComponent(container.name)}?id=${container.id}`}
      className="grid items-center px-5 py-4 transition-colors duration-200"
      style={{
        gridTemplateColumns: "1fr 2fr auto auto",
        background: hovered ? "rgba(245,158,11,0.04)" : "transparent",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Name */}
      <div className="flex items-center gap-3 min-w-0 pr-4">
        <div
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200"
          style={{
            background: hovered ? "rgba(245,158,11,0.12)" : "var(--surface)",
            border: `1px solid ${hovered ? "rgba(245,158,11,0.25)" : "var(--border)"}`,
          }}
        >
          <FolderOpen size={14} className={hovered ? "text-amber-500" : ""} style={hovered ? {} : { color: "var(--muted)" }} />
        </div>
        <span
          className="font-semibold text-sm truncate transition-colors duration-200"
          style={{ color: hovered ? "var(--primary)" : "var(--text)" }}
        >
          {container.name}
        </span>
      </div>

      {/* Description — expands to fit */}
      <p
        className="text-sm leading-relaxed pr-4"
        style={{ color: "var(--muted)" }}
      >
        {container.description || "No description"}
      </p>

      {/* Counter badge */}
      <div className="flex items-center justify-center" style={{ minWidth: "80px" }}>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors duration-200"
          style={{
            background: container.counter > 0
              ? (hovered ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.08)")
              : "rgba(148,163,184,0.08)",
            color: container.counter > 0 ? "var(--primary)" : "var(--muted)",
          }}
        >
          <FileText size={11} />
          {container.counter}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center" style={{ width: "32px" }}>
        <ChevronRight
          size={16}
          className="transition-all duration-200"
          style={{
            color: hovered ? "var(--primary)" : "var(--muted)",
            transform: hovered ? "translateX(2px)" : "translateX(0)",
          }}
        />
      </div>
    </Link>
  );
}
