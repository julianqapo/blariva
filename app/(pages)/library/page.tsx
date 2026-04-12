"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Plus, Search, MoreVertical, FolderOpen, AlignLeft, Loader2 } from "lucide-react";
import CreateContainerModal from "./CreateContainerModal";

// The parent ONLY needs to fetch data now
import { fetchContainers } from "./container_actions";

type Container = {
  id: string;
  name: string;
  description: string;
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
        <div className="flex items-start justify-between mb-8">
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
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              {filtered.length} container{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
         
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            New Container
          </button>
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
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {filtered.map((col) => (
              <ContainerCard key={col.id} container={col} />
            ))}
          </div>
        )}
      </div>

      <CreateContainerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        // 5. When the modal succeeds, close it and fetch the fresh data!
        onSuccess={() => {
          setModalOpen(false);
          loadContainers();
        }}
      />
    </>
  );
}


function ContainerCard({ container }: { container: Container }) {
  return (
    <Link 
      href={`/library/${encodeURIComponent(container.name)}`}
      className="feature-card group relative cursor-pointer block transition-transform hover:-translate-y-1" 
      style={{ padding: "1.5rem" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="icon-wrap" style={{ width: 40, height: 40, borderRadius: 10 }}>
          <BookOpen size={18} className="text-amber-500" />
        </div>
        
        <button
          onClick={(e) => {
            // This stops the link from firing when they just want to open the menu!
            e.preventDefault(); 
            e.stopPropagation();
            // TODO: Trigger your ManageContainerModal open state here
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-amber-500/10"
          style={{ color: "var(--muted)" }}
          aria-label="More options"
        >
          <MoreVertical size={15} />
        </button>
      </div>

      <h3 className="font-display font-bold text-base mb-2 leading-snug truncate">
        {container.name}
      </h3>

      <div className="border-t mb-3" style={{ borderColor: "var(--border)" }} />

      <div className="flex items-start gap-2">
        <AlignLeft size={13} className="shrink-0 mt-0.5" style={{ color: "var(--muted)" }} />
        <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "var(--muted)" }}>
          {container.description || "No description provided."}
        </p>
      </div>
    </Link>
  );
}