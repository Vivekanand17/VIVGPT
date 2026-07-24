import sys
from pathlib import Path

src = Path("frontend/src/components/ChatSection.jsx")
content = src.read_text("utf-8")
original_len = len(content)

# 1. Update imports
old = 'import { motion } from "framer-motion";'
new = 'import { motion, AnimatePresence } from "framer-motion";'
assert old in content, "Step 1 fail"
content = content.replace(old, new)

old = '  Calculator,\n} from "lucide-react";'
new = '  Calculator,\n  Menu,\n  X,\n  Pin,\n  PinOff,\n  MoreHorizontal,\n  Trash2,\n  Pencil,\n} from "lucide-react";'
assert old in content, "Step 2 fail"
content = content.replace(old, new)

# 2. Add state vars
old = "const [isDictating, setIsDictating] = useState(false);\n\n  const sparkSeed"
new = '''const [isDictating, setIsDictating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebar_open");
    return saved !== null ? saved === "true" : true;
  });
  const [pinnedThreads, setPinnedThreads] = useState(() => {
    try { const s = localStorage.getItem("pinned_threads"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [menuOpenThread, setMenuOpenThread] = useState(null);
  const [renamingThread, setRenamingThread] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteConfirmThread, setDeleteConfirmThread] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sparkSeed'''
assert old in content, "Step 3 fail"
content = content.replace(old, new)

# 3. Add refs and click handler
old = "const recognitionRef = useRef(null);\n\n  const scrollToBottom"
new = '''const recognitionRef = useRef(null);
  const menuRef = useRef(null);
  const renameInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpenThread(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToBottom'''
assert old in content, "Step 4 fail"
content = content.replace(old, new)

# 4. Add new functions
old = "const handleKeyDown = (e) => {\n    if (e.key === \"Enter\" && !e.shiftKey) {\n      e.preventDefault();\n      sendMessage();\n    }\n  };\n\n  return ("
new = '''const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => { const n = !prev; localStorage.setItem("sidebar_open", n); return n; });
  };

  const togglePin = (id) => {
    setPinnedThreads((prev) => {
      const u = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("pinned_threads", JSON.stringify(u));
      return u;
    });
  };

  const startRenaming = (conv) => {
    setRenamingThread(conv.thread_id);
    setRenameValue(conv.title || "New Chat");
    setMenuOpenThread(null);
  };

  const submitRename = async () => {
    if (!renamingThread) return;
    const t = renameValue.trim();
    if (t) {
      try {
        await fetch("/conversations/" + renamingThread + "/rename", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: t }) });
        await loadConversations();
      } catch (e) { console.error(e); }
    }
    setRenamingThread(null);
    setRenameValue("");
  };

  const handleRenameKD = (e) => {
    if (e.key === "Enter") { e.preventDefault(); submitRename(); }
    else if (e.key === "Escape") { setRenamingThread(null); setRenameValue(""); }
  };

  const confirmDelete = (id) => { setDeleteConfirmThread(id); setMenuOpenThread(null); };

  const executeDelete = async () => {
    if (!deleteConfirmThread) return;
    try {
      await fetch("/conversations/" + deleteConfirmThread, { method: "DELETE" });
      if (deleteConfirmThread === threadId) {
        const rem = conversations.filter((c) => c.thread_id !== deleteConfirmThread);
        if (rem.length > 0) await loadConversation(rem[0].thread_id);
        else {
          const nid = crypto.randomUUID();
          setThreadId(nid);
          localStorage.setItem("thread_id", nid);
          setMessages([]);
          setShowWelcome(true);
        }
      }
      await loadConversations();
    } catch (e) { console.error(e); }
    setDeleteConfirmThread(null);
  };

  const cancelDelete = () => { setDeleteConfirmThread(null); };

  const sortedConversations = useMemo(() => {
    const p = [], u = [];
    const s = searchQuery.toLowerCase().trim();
    for (const c of conversations) {
      const t = (c.title || "New Chat").toLowerCase();
      if (s && !t.includes(s)) continue;
      if (pinnedThreads.includes(c.thread_id)) p.push(c);
      else u.push(c);
    }
    const sortFn = (a, b) => new Date(b.updated_at) - new Date(a.updated_at);
    p.sort(sortFn);
    u.sort(sortFn);
    return [...p, ...u];
  }, [conversations, pinnedThreads, searchQuery]);

  return ('''
assert old in content, "Step 5 fail"
content = content.replace(old, new)

# 5. Replace sidebar opening tag
old = '<aside className="hidden w-[270px] flex-shrink-0 flex-col border-r border-white/10 bg-white/[0.03] p-3 md:flex backdrop-blur">'
new = '''<aside
          className={"hidden " + (sidebarOpen ? "w-[270px]" : "w-0") + " flex-shrink-0 flex-col border-r border-white/10 bg-white/[0.03] backdrop-blur transition-all duration-300 ease-in-out overflow-hidden md:flex"}
        >
          <div className={(sidebarOpen ? "opacity-100" : "opacity-0") + " transition-opacity duration-200 min-w-[270px] p-3 flex flex-col h-full"}>'''
assert old in content, "Step 6 fail"
content = content.replace(old, new)

# 6. Add search bar
old = '<div className="mb-2 px-3 text-xs font-medium text-neutral-400">\n            Recent Chats'
new = '''<div className="relative mb-3 px-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search chats..." className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-8 pr-3 text-sm text-neutral-200 outline-none placeholder:text-neutral-500 focus:border-violet-400/40" />
              {searchQuery && (<button type="button" onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"><X className="h-3.5 w-3.5" /></button>)}
            </div>
            <div className="mb-2 px-3 text-xs font-medium text-neutral-400">
            Recent Chats'''
assert old in content, "Step 7 fail"
content = content.replace(old, new)

# 7. Replace conversations.map with sortedConversations + features
old = '''conversations.length === 0 ? (
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
            )}'''

new = '''sortedConversations.length === 0 ? (
              <div className="rounded-lg px-2.5 py-2.5 text-sm text-neutral-500">
                {searchQuery ? "No matching chats" : "No chats yet"}
              </div>
            ) : (
              sortedConversations.map((conv) => (
                <div key={conv.thread_id} className="group relative mb-1">
                  {renamingThread === conv.thread_id ? (
                    <input ref={renameInputRef} type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={handleRenameKD} onBlur={submitRename} autoFocus className="w-full rounded-lg border border-violet-400/50 bg-white/10 px-2.5 py-2 text-sm text-white outline-none" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => loadConversation(conv.thread_id)}
                      className={"w-full truncate rounded-lg px-2.5 py-2.5 text-left text-sm transition " + (conv.thread_id === threadId ? "bg-gradient-to-r from-violet-500/25 to-sky-400/15 border-l-2 border-violet-400/70 pl-2 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200")}
                    >
                      {conv.title || "New Chat"}
                    </button>
                  )}
                  {renamingThread !== conv.thread_id && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button type="button" onClick={(e) => { e.stopPropagation(); togglePin(conv.thread_id); }} title={pinnedThreads.includes(conv.thread_id) ? "Unpin" : "Pin"} className="flex h-6 w-6 items-center justify-center rounded text-neutral-500 hover:text-violet-300 hover:bg-white/5">
                        {pinnedThreads.includes(conv.thread_id) ? <Pin className="h-3.5 w-3.5 text-violet-400" /> : <PinOff className="h-3.5 w-3.5" />}
                      </button>
                      <div className="relative">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpenThread(menuOpenThread === conv.thread_id ? null : conv.thread_id); }} title="More" className="flex h-6 w-6 items-center justify-center rounded text-neutral-500 hover:text-neutral-200 hover:bg-white/5">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                        <AnimatePresence>
                          {menuOpenThread === conv.thread_id && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-white/10 bg-[#1a1a2e] py-1 shadow-2xl backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
                              <button type="button" onClick={() => startRenaming(conv)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white"><Pencil className="h-3.5 w-3.5" /> Rename Chat</button>
                              <button type="button" onClick={() => confirmDelete(conv.thread_id)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition hover:bg-white/5 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /> Delete Chat</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                  )}
                </div>
              ))
            )}'''
assert old in content, "Step 8 fail"
content = content.replace(old, new)

# 9. Add extra closing div for sidebar wrapper, delete confirmation
old = '</aside>\n\n        {/* Main chat area */}'
new = '''</div>
        </aside>

        <AnimatePresence>
          {deleteConfirmThread && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={cancelDelete}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.2 }} className="mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a2e] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="mb-2 text-lg font-semibold text-white">Delete chat?</h3>
                <p className="mb-5 text-sm text-neutral-400">This will permanently delete this conversation and its messages.</p>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={cancelDelete} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-neutral-300 transition hover:bg-white/5">Cancel</button>
                  <button type="button" onClick={executeDelete} className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-500">Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main chat area */}'''
assert old in content, "Step 9 fail"
content = content.replace(old, new)

# 10. Add sidebar toggle button
old = '<div className="flex items-center gap-3">\n              <div className="text-lg font-bold">'
new = '''<div className="flex items-center gap-3">
              <button type="button" onClick={toggleSidebar} title={sidebarOpen ? "Close sidebar" : "Open sidebar"} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-white/5 hover:text-white">
                {sidebarOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
              </button>
              <div className="text-lg font-bold">'''
assert old in content, "Step 10 fail"
content = content.replace(old, new)

# 11. Remove md:left-[270px] from input area
old = 'md:left-[270px]'
# Only replace the one in input area (first occurrence after line 700ish)
count = content.count(old)
if count > 0:
    # Replace the LAST occurrence (the one in input div)
    idx = content.rfind(old)
    content = content[:idx] + content[idx:].replace(old, "", 1)
    print("Step 11: Removed md:left-[270px]")
else:
    print("Step 11 SKIP")

print(f"Patched: {original_len} -> {len(content)} bytes ({len(content) - original_len} added)")
src.write_text(content, "utf-8")
print("DONE!")
</｜｜tool_calls>
