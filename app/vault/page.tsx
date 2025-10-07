"use client";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { useVault, type DecryptedVaultItem } from "@/app/contexts/VaultContext";
import { useGenerator } from "@/app/contexts/GeneratorContext";
import { Loader2, Plus, Search, Lock, Eye, EyeOff, Copy, Edit2, Trash2, Check, X, Save, KeyRound, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { type VaultItemData } from "@/app/lib/encryption";
import VaultAccessModal from "@/app/components/VaultAccessModal";
function VaultContent() {
  const router = useRouter();
  const { generatedPassword, setGeneratedPassword } = useGenerator();
  const { user, loading: userLoading } = useUser();
  const { items, loading, error, createItem, updateItem, deleteItem, encryptionKey, setEncryptionKey } = useVault();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DecryptedVaultItem | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [vaultAccessVerified, setVaultAccessVerified] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [keyLoading, setKeyLoading] = useState(false);
  const [formData, setFormData] = useState<VaultItemData>({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  });
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    return () => {
      setEncryptionKey(null);
    };
  }, [setEncryptionKey]);
  useEffect(() => {
    if (mounted && !userLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, userLoading, router, mounted]);
  useEffect(() => {
    if (mounted && user && !vaultAccessVerified) {
      setRequires2FA(user.twoFactorEnabled);
      setShowAccessModal(true);
    }
  }, [mounted, user, vaultAccessVerified]);
  useEffect(() => {
    if (mounted && user && vaultAccessVerified && !encryptionKey) {
      setShowKeyPrompt(true);
    }
  }, [mounted, user, vaultAccessVerified, encryptionKey]);
  useEffect(() => {
    if (generatedPassword && mounted && vaultAccessVerified) {
      setFormData(prev => ({ ...prev, password: generatedPassword }));
      setShowModal(true);
      setGeneratedPassword(null);
    }
  }, [generatedPassword, mounted, vaultAccessVerified, setGeneratedPassword]);
  const handleVerifyAccess = async (password?: string, twoFactorCode?: string) => {
    try {
      const response = await fetch("/api/vault/verify-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, twoFactorCode }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }
      setVaultAccessVerified(true);
      setShowAccessModal(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Verification failed");
    }
  };
  const handleSetKey = async () => {
    if (!keyInput.trim()) {
      setKeyError("Encryption key is required");
      return;
    }
    setKeyError("");
    setKeyLoading(true);
    try {
      const res = await fetch("/api/vault", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.items.length > 0) {
        const { decryptVaultItem } = await import("@/app/lib/encryption");
        try {
          decryptVaultItem(data.items[0].encryptedData, keyInput);
        } catch (_decryptError) {
          setKeyError("Invalid encryption key. Unable to decrypt vault items.");
          setKeyLoading(false);
          return;
        }
      }
      setEncryptionKey(keyInput);
      setShowKeyPrompt(false);
      setKeyInput("");
      setKeyError("");
    } catch (error: unknown) {
      console.error("Key validation error:", error);
      setKeyError("Failed to validate encryption key. Please try again.");
    } finally {
      setKeyLoading(false);
    }
  };
  const handleOpenModal = (item?: DecryptedVaultItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        username: item.username,
        password: item.password,
        url: item.url,
        notes: item.notes,
      });
      setFormTags(item.tags || []);
    } else {
      setEditingItem(null);
      setFormData({ title: "", username: "", password: "", url: "", notes: "" });
      setFormTags([]);
    }
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ title: "", username: "", password: "", url: "", notes: "" });
    setFormTags([]);
    setTagInput("");
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateItem(editingItem._id, formData, formTags);
      } else {
        await createItem(formData, formTags);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Save error:", err);
    }
  };
  const handleDelete = async (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteItem(itemToDelete);
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };
  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(async () => {
        try {
          const current = await navigator.clipboard.readText();
          if (current === text) {
            await navigator.clipboard.writeText("");
            console.log("Clipboard cleared after 15 seconds");
          }
        } catch (err) {
          console.debug("Clipboard auto-clear failed:", err);
        }
      }, 15000);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };
  const handleAddTag = () => {
    if (tagInput.trim() && !formTags.includes(tagInput.trim())) {
      setFormTags([...formTags, tagInput.trim()]);
      setTagInput("");
    }
  };
  const handleRemoveTag = (tag: string) => {
    setFormTags(formTags.filter(t => t !== tag));
  };
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  if (!mounted) return null;
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))` }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--btn-bg)" }} />
      </div>
    );
  }
  if (!user) return null;
  if (!vaultAccessVerified) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))` }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--btn-bg)" }} />
        </div>
        {}
        <VaultAccessModal
          isOpen={showAccessModal}
          requires2FA={requires2FA}
          onVerify={handleVerifyAccess}
          onClose={() => {
            setShowAccessModal(false);
            router.push("/dashboard");
          }}
        />
      </>
    );
  }
  return (
    <>
      <div className="min-h-screen flex flex-col pt-20 pb-12" style={{ background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))` }}>
        <div className="flex-1 px-6 py-12 max-w-7xl mx-auto w-full">
          {}
          <Link href="/dashboard">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mb-4 flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "var(--text)" }}>
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </motion.button>
          </Link>
          {}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 style={{ color: "var(--text)" }} className="text-4xl font-bold mb-2">Secure Vault</h1>
                <p style={{ color: "var(--text-muted)" }} className="text-lg">Your encrypted password storage</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleOpenModal()} className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300" style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}>
                <Plus className="w-5 h-5" />
                Add Item
              </motion.button>
            </div>
            {}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
              <input type="text" placeholder="Search by title, username, URL, or tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", borderColor: "var(--card-border)", color: "var(--text)" }} />
            </div>
          </motion.div>
          {}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500 text-red-500">
              {error}
            </motion.div>
          )}
          {}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--btn-bg)" }} />
            </div>
          )}
          {}
          {!loading && filteredItems.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
              <Lock className="w-20 h-20 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
              <h3 style={{ color: "var(--text)" }} className="text-2xl font-semibold mb-2">
                {searchQuery ? "No items found" : "Your vault is empty"}
              </h3>
              <p style={{ color: "var(--text-muted)" }} className="mb-6">
                {searchQuery ? "Try a different search term" : "Start by adding your first password"}
              </p>
              {!searchQuery && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium" style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}>
                  <Plus className="w-5 h-5" />
                  Add First Item
                </motion.button>
              )}
            </motion.div>
          )}
          {}
          {!loading && filteredItems.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="backdrop-blur-lg rounded-xl shadow-lg p-6 border hover:shadow-xl transition-all duration-300" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", borderColor: "var(--card-border)" }}>
                  {}
                  <div className="flex items-start justify-between mb-4">
                    <h3 style={{ color: "var(--text)" }} className="text-xl font-semibold flex-1 break-words">{item.title || "Untitled"}</h3>
                    <div className="flex items-center gap-2">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleOpenModal(item)} className="p-2 rounded-lg transition-colors hover:bg-white/10">
                        <Edit2 className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(item._id)} className="p-2 rounded-lg transition-colors hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </motion.button>
                    </div>
                  </div>
                  {}
                  {item.username && (
                    <div className="mb-3">
                      <label style={{ color: "var(--text-muted)" }} className="text-xs font-medium mb-1 block">Username</label>
                      <div className="flex items-center gap-2">
                        <p style={{ color: "var(--text)" }} className="flex-1 text-sm break-all">{item.username}</p>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleCopy(item.username, item._id + "-user")} className="p-1.5 rounded transition-colors hover:bg-white/10">
                          {copiedId === item._id + "-user" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />}
                        </motion.button>
                      </div>
                    </div>
                  )}
                  {}
                  <div className="mb-3">
                    <label style={{ color: "var(--text-muted)" }} className="text-xs font-medium mb-1 block">Password</label>
                    <div className="flex items-center gap-2">
                      <p style={{ color: "var(--text)" }} className="flex-1 text-sm font-mono break-all">
                        {showPassword[item._id] ? item.password : "••••••••"}
                      </p>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowPassword({ ...showPassword, [item._id]: !showPassword[item._id] })} className="p-1.5 rounded transition-colors hover:bg-white/10">
                        {showPassword[item._id] ? <EyeOff className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} /> : <Eye className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />}
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleCopy(item.password, item._id + "-pass")} className="p-1.5 rounded transition-colors hover:bg-white/10">
                        {copiedId === item._id + "-pass" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />}
                      </motion.button>
                    </div>
                  </div>
                  {}
                  {item.url && (
                    <div className="mb-3">
                      <label style={{ color: "var(--text-muted)" }} className="text-xs font-medium mb-1 block">URL</label>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline break-all" style={{ color: "var(--btn-bg)" }}>{item.url}</a>
                    </div>
                  )}
                  {}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: "var(--btn-bg)", color: "#fff", opacity: 0.8 }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {}
                  <p style={{ color: "var(--text-muted)" }} className="text-xs mt-4">
                    Modified: {new Date(item.lastModified).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      {}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-lg rounded-2xl shadow-2xl p-8 border" style={{ backgroundColor: "var(--modal-bg)", borderColor: "var(--card-border)" }}>
              <div className="flex items-center justify-between mb-6">
                <h2 style={{ color: "var(--text)" }} className="text-2xl font-bold">{editingItem ? "Edit Item" : "Add New Item"}</h2>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleCloseModal} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: "rgba(0, 0, 0, 0.05)", color: "var(--text)" }}>
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label style={{ color: "var(--text)" }} className="block text-sm font-medium mb-2">Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", borderColor: "var(--card-border)", color: "var(--text)" }} placeholder="e.g., Gmail Account" />
                </div>
                <div>
                  <label style={{ color: "var(--text)" }} className="block text-sm font-medium mb-2">Username</label>
                  <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", borderColor: "var(--card-border)", color: "var(--text)" }} placeholder="john@example.com" />
                </div>
                <div>
                  <label style={{ color: "var(--text)" }} className="block text-sm font-medium mb-2">Password *</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="flex-1 px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 font-mono" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", borderColor: "var(--card-border)", color: "var(--text)" }} placeholder="••••••••" />
                    <Link href="/generator">
                      <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}>
                        <KeyRound className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </div>
                </div>
                <div>
                  <label style={{ color: "var(--text)" }} className="block text-sm font-medium mb-2">URL</label>
                  <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", borderColor: "var(--card-border)", color: "var(--text)" }} placeholder="https://example.com" />
                </div>
                <div>
                  <label style={{ color: "var(--text)" }} className="block text-sm font-medium mb-2">Notes</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 resize-none" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", borderColor: "var(--card-border)", color: "var(--text)" }} placeholder="Additional notes..." />
                </div>
                <div>
                  <label style={{ color: "var(--text)" }} className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())} className="flex-1 px-4 py-2 rounded-xl border transition-all focus:outline-none focus:ring-2" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", borderColor: "var(--card-border)", color: "var(--text)" }} placeholder="Add tag..." />
                    <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddTag} className="px-4 py-2 rounded-xl" style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}>Add</motion.button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formTags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full text-sm flex items-center gap-2" style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}>
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:opacity-70">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCloseModal} className="flex-1 px-6 py-3 rounded-xl font-medium transition-all" style={{ backgroundColor: "rgba(0, 0, 0, 0.05)", color: "var(--text)" }}>Cancel</motion.button>
                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50" style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {editingItem ? "Update" : "Save"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md backdrop-blur-lg rounded-2xl shadow-2xl p-8 border"
              style={{ backgroundColor: "var(--modal-bg)", borderColor: "var(--card-border)" }}
            >
              <div className="text-center mb-6">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                >
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h2 style={{ color: "var(--text)" }} className="text-2xl font-bold mb-2">
                  Delete Item?
                </h2>
                <p style={{ color: "var(--text-muted)" }} className="text-sm">
                  This action cannot be undone. The item will be permanently deleted from your vault.
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={cancelDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-6 py-3 rounded-xl font-medium transition-all border-2"
                  style={{
                    borderColor: "var(--card-border)",
                    color: "var(--text)",
                    backgroundColor: "transparent",
                    opacity: deleteLoading ? 0.5 : 1,
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#ef4444",
                    color: "#fff",
                    opacity: deleteLoading ? 0.7 : 1,
                  }}
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </motion.button>
              </div>
              <div
                className="mt-4 p-3 rounded-lg"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.05)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                <p style={{ color: "var(--text-muted)" }} className="text-xs text-center">
                  ⚠️ This will permanently remove the encrypted data from the server.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {}
      <AnimatePresence>
        {showKeyPrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-md backdrop-blur-lg rounded-2xl shadow-2xl p-8 border" style={{ backgroundColor: "var(--modal-bg)", borderColor: "var(--card-border)" }}>
              <div className="text-center mb-6">
                <Lock className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--btn-bg)" }} />
                <h2 style={{ color: "var(--text)" }} className="text-2xl font-bold mb-2">Encryption Key Required</h2>
                <p style={{ color: "var(--text-muted)" }} className="text-sm">Enter your encryption key to unlock the vault. This key encrypts/decrypts your passwords locally.</p>
              </div>
              <div className="space-y-4">
                <input 
                  type="password" 
                  value={keyInput} 
                  onChange={(e) => setKeyInput(e.target.value)} 
                  onKeyPress={(e) => e.key === "Enter" && !keyLoading && handleSetKey()} 
                  placeholder="Enter encryption key" 
                  disabled={keyLoading}
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2" 
                  style={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.1)", 
                    borderColor: keyError ? "#ef4444" : "var(--card-border)", 
                    color: "var(--text)",
                    opacity: keyLoading ? 0.6 : 1,
                  }} 
                />
                {keyError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    <p className="text-sm text-red-500 text-center font-medium">{keyError}</p>
                  </motion.div>
                )}
                <motion.button 
                  whileHover={!keyLoading ? { scale: 1.02 } : {}} 
                  whileTap={!keyLoading ? { scale: 0.98 } : {}} 
                  onClick={handleSetKey} 
                  disabled={keyLoading}
                  className="w-full px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2" 
                  style={{ 
                    backgroundColor: "var(--btn-bg)", 
                    color: "#fff",
                    opacity: keyLoading ? 0.7 : 1,
                    cursor: keyLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {keyLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    "Unlock Vault"
                  )}
                </motion.button>
                <p style={{ color: "var(--text-muted)" }} className="text-xs text-center mt-4">
                  💡 <strong>Tip:</strong> Use your account password or a memorable phrase. This key is never sent to the server.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
export default function VaultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    }>
      <VaultContent />
    </Suspense>
  );
}
