import sys
from pathlib import Path

filepath = Path("frontend/src/components/ChatSection.jsx")
content = filepath.read_text(encoding="utf-8")
original_len = len(content)

# Check file state
print(f"Original size: {original_len} bytes")

# Step 1: Update imports - add AnimatePresence
old1 = 'import { motion } from "framer-motion";'
new1 = 'import { motion, AnimatePresence } from "framer-motion";'
assert old1 in content, "FAIL: old1 not found"
content = content.replace(old1, new1)
print("Step 1 OK: Added AnimatePresence import")

# Step 2: Add new lucide icons
old2 = '  Calculator,\n} from "lucide-react";'
new2 = '  Calculator,\n  Menu,\n  X,\n  Pin,\n  PinOff,\n  MoreHorizontal,\n  Trash2,\n  Pencil,\n} from "lucide-react";'
assert old2 in content, "FAIL: old2 not found"
content = content.replace(old2, new2)
print("Step 2 OK: Added new lucide icons")

# Step 3: Add new state variables after isDictating
old3 = 'const [isDictating, setIsDictating] = useState(false);\n\n  const sparkSeed'
new3 = 'const [isDictating, setIsDictating] = useState(false);\n\n  const [sidebarOpen, setSidebarOpen] = useState(() => {\n    const saved = localStorage.getItem("sidebar_open");\n    return saved !== null ? saved === "true" : true;\n  });\n\n  const [pinnedThreads, setPinnedThreads] = useState(() => {\n    try { const saved = localStorage.getItem("pinned_threads"); return saved ? JSON.parse(saved) : []; }\n    catch { return []; }\n  });\n\n  const [menuOpenThread, setMenuOpenThread] = useState(null);\n  const [renamingThread, setRenamingThread] = useState(null);\n  const [renameValue, setRenameValue] = useState("");\n  const [deleteConfirmThread, setDeleteConfirmThread] = useState(null);\n  const [searchQuery, setSearchQuery] = useState("");\n\n  const sparkSeed'
assert old3 in content, "FAIL: old3 not found"
content = content.replace(old3, new3)
print("Step 3 OK: Added state variables")

# Step 4: Add new refs and click outside handler
old4 = 'const recognitionRef = useRef(null);\n\n  const scrollToBottom'
new4 = 'const recognitionRef = useRef(null);\n  const menuRef = useRef(null);\n  const renameInputRef = useRef(null);\n\n  useEffect(() => {\n    const handleClickOutside = (e) => {\n      if (menuRef.current && !menuRef.current.contains(e.target)) {\n        setMenuOpenThread(null);\n      }\n    };\n    document.addEventListener("mousedown", handleClickOutside);\n    return () => document.removeEventListener("mousedown", handleClickOutside);\n  }, []);\n\n  const scrollToBottom'
assert old4 in content, "FAIL: old4 not found"
content = content.replace(old4, new4)
print("Step 4 OK: Added refs and click handler")

# Step 5: Add new functions before return
old5 = "const handleKeyDown = (e) => {\n    if (e.key === \"Enter\" && !e.shiftKey) {\n      e.preventDefault();\n      sendMessage();\n    }\n  };\n\n  return ("
new5 = """  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newVal = !prev;
      localStorage.setItem("sidebar_open", newVal);
      return newVal;
    });
  };

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
    if (e.key === "Enter") { e.preventDefault(); submitRename(); }
    else if (e.key === "Escape") { setRenamingThread(null); setRenameValue(""); }
  };

  const confirmDelete = (convThreadId) => {
    setDeleteConfirmThread(convThreadId);
    setMenuOpenThread(null);
  };

  const executeDelete = async () => {
    if (!deleteConfirmThread) return;
    try {
      await fetch(`/conversations/${deleteConfirmThread}`, { method: "DELETE" });
      if (deleteConfirmThread === threadId) {
        const remaining = conversations.filter((c) => c.thread_id !== deleteConfirmThread);
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

  const cancelDelete = () => { setDeleteConfirmThread(null); };

  const sortedConversations = useMemo(() => {
    const pinned = [];
    const unpinned = [];
    const search = searchQuery.toLowerCase().trim();
    for (const conv of conversations) {
      const title = (conv.title || "New Chat").toLowerCase();
      if (search && !title.includes(search)) continue;
      if (pinnedThreads.includes(conv.thread_id)) pinned.push(conv);
      else unpinned.push(conv);
    }
    const sortByDate = (a, b) => new Date(b.updated_at) - new Date(a.updated_at);
    pinned.sort(sortByDate);
    unpinned.sort(sortByDate);
    return [...pinned, ...unpinned];
  }, [conversations, pinnedThreads, searchQuery]);

  return ("""
assert old5 in content, "FAIL: old5 not found"
content = content.replace(old5, new5)
print("Step 5 OK: Added new functions")

# Step 6: Replace sidebar with collapsible one with features
old6 = '<aside className="hidden w-[270px] flex-shrink-0 flex-col border-r border-white/10 bg-white/[0.03] p-3 md:flex backdrop-blur">'
new6_start = '''<aside
          className={`${
            sidebarOpen ? "w-[270px]" : "w-0"
          } flex-shrink-0 flex-col border-r border-white/10 bg-white/[0.03] backdrop-blur transition-all duration-300 ease-in-out overflow-hidden hidden md:flex`}
        >
          <div className={`${sidebarOpen ? "opacity-100" : "opacity-0"} transition-opacity duration-200 min-w-[270px] p-3 flex flex-col h-full`}>'''
assert old6 in content, "FAIL: old6 not found"
content = content.replace(old6, new6_start)
print("Step 6a OK: Sidebar collapsible wrapper")

# Step 6b: Add search bar before "Recent Chats"
old6b = '<div className="mb-2 px-3 text-xs font-medium text-neutral-400">\n            Recent Chats'
new6b = '''{/* Search Chats */}
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
            Recent Chats'''
assert old6b in content, "FAIL: old6b not found"
content = content.replace(old6b, new6b)
print("Step 6b OK: Added search bar")

# Step 6c: Replace conversations.map with sorted conversations with pin/rename/menu
old6c = '''conversations.map((conv) => (
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
              ))'''

new6c = '''sortedConversations.map((conv) => (
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
                          onClick={(e) => { e.stopPropagation(); togglePin(conv.thread_id); }}
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
                            onClick={(e) => { e.stopPropagation(); setMenuOpenThread(menuOpenThread === conv.thread_id ? null : conv.thread_id); }}
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
                                <button type="button" onClick={() => startRenaming(conv)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white">
                                  <Pencil className="h-3.5 w-3.5" /> Rename Chat
                                </button>
                                <button type="button" onClick={() => confirmDelete(conv.thread_id)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition hover:bg-white/5 hover:text-red-300">
                                  <Trash2 className="h-3.5 w-3.5" /> Delete Chat
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                    )}
                  </div>
                ))'''

assert old6c in content, "FAIL: old6c not found"
content = content.replace(old6c, new6c)
print("Step 6c OK: Added pin/rename/context menu")

# Step 6d: Close sidebar wrapper divs properly  
# The old sidebar closing was: </aside>
# We need to add extra closing div before </aside>
old6d = '</aside>\n\n        {/* Main chat area */}'
new6d = '</div>\n        </aside>\n\n        {/* Delete confirmation overlay */}\n        <AnimatePresence>\n          {deleteConfirmThread && (\n            <motion.div\n              initial={{ opacity: 0 }}\n              animate={{ opacity: 1 }}\n              exit={{ opacity: 0 }}\n              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"\n              onClick={cancelDelete}\n            >\n              <motion.div\n                initial={{ scale: 0.9, opacity: 0 }}\n                animate={{ scale: 1, opacity: 1 }}\n                exit={{ scale: 0.9, opacity: 0 }}\n                transition={{ duration: 0.2 }}\n                className="mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a2e] p-6 shadow-2xl"\n                onClick={(e) => e.stopPropagation()}\n              >\n                <h3 className="mb-2 text-lg font-semibold text-white">Delete chat?</h3>\n                <p className="mb-5 text-sm text-neutral-400">This will permanently delete this conversation and its messages.</p>\n                <div className="flex justify-end gap-3">\n                  <button type="button" onClick={cancelDelete} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-neutral-300 transition hover:bg-white/5">Cancel</button>\n                  <button type="button" onClick={executeDelete} className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-500">Delete</button>\n                </div>\n              </motion.div>\n            </motion.div>\n          )}\n        </AnimatePresence>\n\n        {/* Main chat area */}'
assert old6d in content, "FAIL: old6d not found"
content = content.replace(old6d, new6d)
print("Step 6d OK: Added delete confirmation and sidebar closing")

# Step 7: Add sidebar toggle button in topbar
old7 = '<div className="flex items-center gap-3">\n              <div className="text-lg font-bold">'
new7 = '<div className="flex items-center gap-3">\n              <button\n                type="button"\n                onClick={toggleSidebar}\n                title={sidebarOpen ? "Close sidebar" : "Open sidebar"}\n                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-white/5 hover:text-white"\n              >\n                {sidebarOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}\n              </button>\n              <div className="text-lg font-bold">'
assert old7 in content, "FAIL: old7 not found"
content = content.replace(old7, new7)
print("Step 7 OK: Added sidebar toggle button")

# Step 8: Remove md:left-[270px] from input area since sidebar now collapses
old8 = '<div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-10 md:left-[270px]">'
new8 = '<div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-10">'
assert old8 in content, "FAIL: old8 not found"
content = content.replace(old8, new8)
print("Step 8 OK: Removed fixed input left offset")

# Step 9: Update conversations.length check to sortedConversations.length in sidebar
old9 = '{conversations.length === 0 ? ('
new9 = '{sortedConversations.length === 0 ? ('
# Only replace first occurrence (in sidebar)
idx = content.find(old9)
if idx >= 0:
    content = content[:idx] + content[idx:].replace(old9, new9, 1)
    print("Step 9 OK: Updated conversation count check")
else:
    print("Step 9 SKIP: Not needed")

print(f"\nFinal size: {len(content)} bytes")
filepath.write_text(content, encoding="utf-8")
print("\nDONE! ChatSection.jsx patched successfully.")
</｜｜DSML｜｜parameter>
</｜｜DSML｜｜invoke>
</｜｜DSML｜｜tool_calls>
