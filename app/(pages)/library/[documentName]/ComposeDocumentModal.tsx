"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Save, Type } from "lucide-react";

export default function ComposeDocumentModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simple Word Counter
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  useEffect(() => {
    if (open) {
      setName(""); setContent("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  async function handleSave() {
    if (!name.trim() || !content.trim()) return;
    setLoading(true);
    // TODO: Call your server action to save the document
    console.log("Saving...", { name, content });
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-5xl h-[85vh] bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Type size={20} className="text-amber-500" />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Document Title..."
              className="bg-transparent border-none outline-none font-display font-bold text-xl w-full placeholder:text-slate-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Text Area Body */}
        <div className="flex-1 relative">
          <textarea
            className="w-full h-full p-8 bg-transparent outline-none resize-none text-slate-300 leading-relaxed text-lg placeholder:text-slate-800"
            placeholder="Start typing or paste your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-4 border-t border-slate-800 bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Words: <span className="text-amber-500 ml-1">{wordCount}</span>
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Chars: <span className="text-slate-300 ml-1">{content.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="btn-ghost px-6" disabled={loading}>Cancel</button>
            <button 
              onClick={handleSave}
              disabled={loading || !name.trim() || !content.trim()}
              className="btn-primary px-8 flex items-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}