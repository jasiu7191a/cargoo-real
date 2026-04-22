"use client";

import React, { useState } from "react";
import { FileText, Globe, X, Trash2, Eye } from "lucide-react";

export function SeoArtifactList({ initialPosts = [] }: { initialPosts?: any[] }) {
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [filter, setFilter] = useState<"ALL" | "DRAFT" | "PUBLISHED">("ALL");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialPosts.length > 0) return;

    async function fetchPosts() {
      try {
        const res = await fetch("/api/admin/content");
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (e) {
        console.error("Failed to fetch posts:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [initialPosts]);

  const filteredPosts = posts.filter((post) => {
    if (filter === "ALL") return true;
    return post.status === filter;
  });

  const handlePublish = async (id: string, currentStatus: string) => {
    if (currentStatus === "PUBLISHED") return;
    setIsUpdating(id);
    try {
      const res = await fetch("/api/admin/content/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "PUBLISH" }),
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "PUBLISHED" } : p))
        );
      } else {
        alert("Publishing failed.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const res = await fetch("/api/admin/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setConfirmDelete(null);
        if (selectedPost?.id === id) setSelectedPost(null);
      } else {
        alert("Delete failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error during delete.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="lg:col-span-2 glass-panel p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold uppercase">Recent Artifacts</h3>
        <div className="flex gap-2">
          {(["ALL", "DRAFT", "PUBLISHED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all ${
                filter === f
                  ? "bg-[#ff5500] text-black border-transparent"
                  : "bg-white/5 border-white/10"
              }`}
            >
              {f === "ALL" ? "All Posts" : f === "DRAFT" ? "Drafts" : "Published"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-[#ff5500]/20 border-t-[#ff5500] rounded-full animate-spin" />
            <div className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] animate-pulse">
              Syncing Content Matrix...
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-8 text-center text-[#94a3b8] italic">
            No artifacts match this filter.
          </div>
        ) : (
          filteredPosts.map((post: any) => (
            <div
              key={post.id}
              className="group bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center hover:border-white/30 transition-all"
            >
              {/* Left: icon + title */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 shrink-0 bg-white/5 rounded-xl flex items-center justify-center text-[#94a3b8]">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 cursor-pointer" onClick={() => setSelectedPost(post)}>
                  <div className="font-bold text-sm text-white group-hover:text-[#ff5500] transition-colors truncate">
                    {post.title}
                  </div>
                  <div className="text-xs text-[#94a3b8]">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Right: status + actions */}
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span
                  className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                    post.status === "PUBLISHED"
                      ? "bg-[#00c853]/10 text-[#00c853]"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {post.status}
                </span>

                {/* Review button */}
                <button
                  onClick={() => setSelectedPost(post)}
                  title="Review article"
                  className="p-2 text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <Eye size={16} />
                </button>

                {/* Publish button (drafts only) */}
                {post.status !== "PUBLISHED" && (
                  <button
                    onClick={() => handlePublish(post.id, post.status)}
                    disabled={isUpdating === post.id}
                    title="Publish article"
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase bg-white/10 hover:bg-[#ff5500] hover:text-black transition-all px-3 py-1.5 rounded-lg disabled:opacity-50"
                  >
                    <Globe size={12} />
                    {isUpdating === post.id ? "Publishing..." : "Publish"}
                  </button>
                )}

                {/* Delete button */}
                <button
                  onClick={() => setConfirmDelete(post.id)}
                  title="Delete article"
                  className="p-2 text-[#94a3b8] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-red-500/30 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Delete Article?</h3>
                <p className="text-xs text-[#94a3b8] mt-1">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-white/70 mb-8 bg-white/5 p-4 rounded-xl border border-white/5 italic">
              "{posts.find((p) => p.id === confirmDelete)?.title}"
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={isDeleting === confirmDelete}
                className="flex-[2] py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black uppercase text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting === confirmDelete ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Preview Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0d0d0d]">
              <div className="min-w-0 flex-1 mr-4">
                <h4 className="text-xs font-black uppercase text-[#ff5500] tracking-widest mb-1">
                  Article Preview
                </h4>
                <div className="text-lg font-bold truncate">{selectedPost.title}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {selectedPost.status !== "PUBLISHED" && (
                  <button
                    onClick={() => handlePublish(selectedPost.id, selectedPost.status)}
                    disabled={isUpdating === selectedPost.id}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase bg-[#ff5500] text-black hover:bg-[#ff7700] px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                  >
                    <Globe size={12} />
                    {isUpdating === selectedPost.id ? "Publishing..." : "Publish"}
                  </button>
                )}
                <button
                  onClick={() => setConfirmDelete(selectedPost.id)}
                  className="p-2 text-[#94a3b8] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-black uppercase text-[#94a3b8] mb-2 tracking-widest">URL Slug</div>
                  <div className="text-xs font-mono text-[#ff5500]">/{selectedPost.slug}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-black uppercase text-[#94a3b8] mb-2 tracking-widest">SEO Keyword</div>
                  <div className="text-xs font-bold text-white uppercase">{selectedPost.targetKeyword}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase text-[#94a3b8] mb-2 tracking-widest">Meta Description</div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-white/70 italic">
                  {selectedPost.metaDescription}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase text-[#94a3b8] mb-4 tracking-widest">Article Body</div>
                <div className="text-white/80 whitespace-pre-wrap font-serif text-base leading-relaxed">
                  {selectedPost.content}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end bg-[#0d0d0d]">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 font-bold uppercase text-xs rounded-xl transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
