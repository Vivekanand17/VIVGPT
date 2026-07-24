#!/usr/bin/env python3
"""Build the updated ChatSection.jsx with sidebar features."""
from pathlib import Path

jsx_path = Path("frontend/src/components/ChatSection.jsx")

# Define the sidebar features to inject
# We'll add state variables, functions, and modify the JSX

# First, update the imports
old_imports = '''import { motion } from "framer-motion";
import {
  Paperclip,'''

new_imports = '''import { motion, AnimatePresence } from "framer-motion";
import {
  Paperclip,
  Menu,
  X,
  Pin,
  PinOff,
  MoreHorizontal,
  Trash2,
  Pencil,'''

old_lucide_close = '''  Calculator,
} from "lucide-react";'''

new_lucide_close = '''  Calculator,
  Menu,
  X,
  Pin,
  PinOff,
  MoreHorizontal,
  Trash2,
  Pencil,
} from "lucide-react";'''

# Read current content
content = jsx_path.read_text(encoding='utf-8')

# Apply import changes
assert old_imports in content, "old_imports not found!"
content = content.replace(old_imports, new_imports)
assert old_lucide_close in content, "old_lucide_close not found!"
content = content.replace(old_lucide_close, new_lucide_close)

# Add new state variables after isDictating
old_state_end = '''  const [isDictating, setIsDictating] = useState(false);

  const sparkSeed = useMemo(() => Math.random(), []);'''

new_state_vars = '''  const [isDictating, setIsDictating] = useState(false);

  // Sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebar_open");
    return saved !== null ? saved === "true" : true;
  });

  // Pinned threads state
  const [pinnedThreads, setPinnedThreads] = useState(() => {
    try {
      const saved = localStorage.getItem("pinned_threads");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Three-dot menu state
  const [menuOpenThread, setMenuOpenThread] = useState(null);

  // Rename state
  const [renamingThread, setRenamingThread] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // Delete confirmation state
  const [deleteConfirmThread, setDeleteConfirmThread] = useState(null);

  // Search query state
  const [searchQuery, setSearchQuery] = useState("");

  const sparkSeed = useMemo(() => Math.random(), []);'''

assert old_state_end in content, "old_state_end not found!"
content = content.replace(old_state_end, new_state_vars)

# Add new refs after recognitionRef
old_refs_end = '''  const recognitionRef = useRef(null);

  const scrollToBottom = useCallback(() => {'''

new_refs_end = '''  const recognitionRef = useRef(null);
  const menuRef = useRef(null);
  const renameInputRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenThread(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToBottom = useCallback(() => {'''

assert old_refs_end in content, "old_refs_end not found!"
content = content.replace(old_refs_end, new_refs_end)

# Add new functions before return statement
old_before_return = '''  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return ('''

new_before_return = '''  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newVal = !prev;
      localStorage.setItem("sidebar_open", newVal);
      return newVal;
    });
  };

  // Pin / Unpin
  const togglePin = (convThreadId) => {
    setPinnedThreads((prev) => {
      let updated;
      if (prev.includes(convThreadId)) {
        updated = prev.filter((id) => id !== convThreadId);
      } else {
        updated = [...prev, convThreadId];
      }
      localStorage.setItem("pinned_threads", JSON.stringify(updated));
      return updated;
    });
  };

  // Rename
  const startRenaming = (conv) => {
    setRenamingThread(conv.thread_id);
    setRenameValue(conv.title || "New Chat");
    setMenuOpenThread(null);
  };

  const submitRename = async () => {
    if (!renamingThread) return;
    const newTitle = renameValue.trim();
    if (newTitle) {
      try {
        await fetch(`/conversations/${renamingThread}/rename`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });
        await loadConversations();
      } catch (error) {
        console.error("Failed to rename:", error);
      }
    }
    setRenamingThread(null);
    setRenameValue("");
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitRename();
    } else if (e.key === "Escape") {
      setRenamingThread(null);
      setRenameValue("");
    }
  };

  // Delete
  const confirmDelete = (convThreadId) => {
    setDeleteConfirmThread(convThreadId);
    setMenuOpenThread(null);
  };

  const executeDelete = async () => {
    if (!deleteConfirmThread) return;
    try {
      await fetch(`/conversations/${deleteConfirmThread}`, {
        method: "DELETE",
      });
      if (deleteConfirmThread === threadId) {
        const remaining = conversations.filter(
          (c) => c.thread_id !== deleteConfirmThread
        );
        if (remaining.length > 0) {
          await loadConversation(remaining[0].thread_id);
        } else {
          const newId = crypto.randomUUID();
          setThreadId(newId);
          localStorage.setItem("thread_id", newId);
          setMessages([]);
          setShowWelcome(true);
        }
      }
      await loadConversations();
    } catch (error) {
      console.error("Failed to delete:", error);
    }
    setDeleteConfirmThread(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmThread(null);
  };

  // Sorted conversations: pinned first, then by updated_at
  const sortedConversations = useMemo(() => {
    const pinned = [];
    const unpinned = [];
    const search = searchQuery.toLowerCase().trim();
    for (const conv of conversations) {
      const title = (conv.title || "New Chat").toLowerCase();
      if (search && !title.includes(search)) continue;
      if (pinnedThreads.includes(conv.thread_id)) {
        pinned.push(conv);
      } else {
        unpinned.push(conv);
      }
    }
    const sortByDate = (a, b) => new Date(b.updated_at) - new Date(a.updated_at);
    pinned.sort(sortByDate);
    unpinned.sort(sortByDate);
    return [...pinned, ...unpinned];
  }, [conversations, pinnedThreads, searchQuery]);

  return ('''

assert old_before_return in content, "old_before_return not found!"
content = content.replace(old_before_return, new_before_return)

# Replace the sidebar aside element
old_sidebar = '''        {/* Sidebar */}
        <aside className="hidden w-[270px] flex-shrink-0 flex-col border-r border-white/10 bg-white/[0.03] p-3 md:flex backdrop-blur">
          <div className="flex items-center gap-2 px-3 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
              <Sparkles className="h-4.5 w-4.5 text-violet-300" />
            </div>
            <div className="text-lg font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-white via-violet-200 to-sky-200 bg-clip-text text-transparent">
                VIVGPT
              </span>
            </div>

          <button
            type="button"
            onClick={newChat}
            className="mb-4 flex items-center justify-center gap-2 rounded-2xl border border-violet-400/30 bg-violet-500/15 px-3 py-3 text-sm font-semibold text-violet-100 shadow-[0_0_30px_rgba(139,92,246,0.18)] transition hover:shadow-[0_0_55px_rgba(139,92,246,0.28)] hover:bg-violet-500/20"
          >
            <Plus className="h-4 w-4" />
             New Chat
          </button>

          <div className="mb-2 px-3 text-xs font-medium text-neutral-400">
            Recent Chats
          </div>
          <div className="flex-1 overflow-y-auto pr-1">

            {conversations.length === 0 ? (
              <div className="rounded-lg px-2.5 py-2.5 text-sm text-neutral-500">
                No chats yet
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.thread_id}
                  type="button"
                  onClick={() => loadConversation(conv.thread_id)}
                  className={`mb-1 w-full truncate rounded-lg px-2.5 py-2.5 text-left text-sm transition ${
                  conv.thread_id === threadId
                      ? "bg-gradient-to-r from-violet-500/25 to-sky-400/15 border-l-2 border-violet-400/70 pl-2 text-white"
                      : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                  }`}
                >

                  {conv.title || "New Chat"}
                </button>
              ))
            )}
          </div>
        </aside>'''

new_sidebar = '''        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-[270px]" : "w-0"
          } flex-shrink-0 flex-col border-r border-white/10 bg-white/[0.03] backdrop-blur transition-all duration-300 ease-in-out overflow-hidden hidden md:flex`}
        >
          <div className={`${sidebarOpen ? "opacity-100" : "opacity-0"} transition-opacity duration-200 min-w-[270px] p-3 flex flex-col h-full`}>
            <div className="flex items-center gap-2 px-3 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
                <Sparkles className="h-4.5 w-4.5 text-violet-300" />
              </div>
              <div className="text-lg font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-white via-violet-200 to-sky-200 bg-clip-text text-transparent">
                  VIVGPT
                </span>
              </div>

            <button
              type="button"
              onClick={newChat}
              className="mb-4 flex items-center justify-center gap-2 rounded-2xl border border-violet-400/30 bg-violet-500/15 px-3 py-3 text-sm font-semibold text-violet-100 shadow-[0_0_30px_rgba(139,92,246,0.18)] transition hover:shadow-[0_0_55px_rgba(139,92,246,0.28)] hover:bg-violet-500/20"
            >
              <Plus className="h-4 w-4" />
               New Chat
            </button>

            {/* Search Chats */}
            <div className="relative mb-3 px-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-8 pr-3 text-sm text-neutral-200 outline-none placeholder:text-neutral-500 focus:border-violet-400/40"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="mb-2 px-3 text-xs font-medium text-neutral-400">
              Recent Chats
            </div>
            <div className="flex-1 overflow-y-auto pr-1">

              {sortedConversations.length === 0 ? (
                <div className="rounded-lg px-2.5 py-2.5 text-sm text-neutral-500">
                  {searchQuery ? "No matching chats" : "No chats yet"}
                </div>
              ) : (
                sortedConversations.map((conv) => (
                  <div key={conv.thread_id} className="group relative mb-1">
                    {renamingThread === conv.thread_id ? (
                      <input
                        ref={renameInputRef}
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={handleRenameKeyDown}
                        onBlur={submitRename}
                        autoFocus
                        className="w-full rounded-lg border border-violet-400/50 bg-white/10 px-2.5 py-2 text-sm text-white outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => loadConversation(conv.thread_id)}
                        className={`w-full truncate rounded-lg px-2.5 py-2.5 text-left text-sm transition ${
                          conv.thread_id === threadId
                            ? "bg-gradient-to-r from-violet-500/25 to-sky-400/15 border-l-2 border-violet-400/70 pl-2 text-white"
                            : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                        }`}
                      >
                        {conv.title || "New Chat"}
                      </button>
                    )}

                    {renamingThread !== conv.thread_id && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(conv.thread_id);
                          }}
                          title={pinnedThreads.includes(conv.thread_id) ? "Unpin" : "Pin"}
                          className="flex h-6 w-6 items-center justify-center rounded text-neutral-500 hover:text-violet-300 hover:bg-white/5"
                        >
                          {pinnedThreads.includes(conv.thread_id) ? (
                            <Pin className="h-3.5 w-3.5 text-violet-400" />
                          ) : (
                            <PinOff className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenThread(menuOpenThread === conv.thread_id ? null : conv.thread_id);
                            }}
                            title="More"
                            className="flex h-6 w-6 items-center justify-center rounded text-neutral-500 hover:text-neutral-200 hover:bg-white/5"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>

                          <AnimatePresence>
                            {menuOpenThread === conv.thread_id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-white/10 bg-[#1a1a2e] py-1 shadow-2xl backdrop-blur-xl"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => startRenaming(conv)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Rename Chat
                                </button>
                                <button
                                  type="button"
                                  onClick={() => confirmDelete(conv.thread_id)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition hover:bg-white/5 hover:text-red-300"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete Chat
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                    )}
                  </div>
                ))
              )}
            </div>
        </aside>'''

assert old_sidebar in content, "old_sidebar not found!"
content = content.replace(old_old_sidebar, new_sidebar)

# Add sidebar toggle button in topbar and delete confirmation overlay
old_topbar = '''          <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-white/10 bg-[rgba(5,8,22,0.7)] px-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="text-lg font-bold">

assert old_topbar in content, "old_topbar not found!"
content = content.replace(old_topbar, new_topbar)

# Add delete confirmation overlay after sidebar end
old_after_sidebar = '''        </aside>

        {/* Main chat area */}'''

new_after_sidebar = '''        </aside>

        {/* Delete confirmation overlay */}
        <AnimatePresence>
          {deleteConfirmThread && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={cancelDelete}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a2e] p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="mb-2 text-lg font-semibold text-white">Delete chat?</h3>
                <p className="mb-5 text-sm text-neutral-400">
                  This will permanently delete this conversation and its messages.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={cancelDelete}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm text-neutral-300 transition hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={executeDelete}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main chat area */}'''

assert old_after_sidebar in content, "old_after_sidebar not found!"
content = content.replace(old_after_sidebar, new_after_sidebar)

# Write the modified content
jsx_path.write_text(content, encoding='utf-8')
print("ChatSection.jsx updated successfully!")
print(f"File size: {len(content)} bytes")
</｜｜DSML｜｜parameter>
</｜｜DSML｜｜invoke>
</｜｜DSML｜｜tool_calls>
