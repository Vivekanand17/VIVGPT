#!/usr/bin/env python3
"""Script to write the updated ChatSection.jsx file."""
import sys
from pathlib import Path

filepath = Path("frontend/src/components/ChatSection.jsx")

content = r"""import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Paperclip,
  Mic,
  MicOff,
  Send,
  Plus,
  Loader2,
  Check,
  Sparkles,
  Search,
  FileText,
  Brain,
  Calculator,
  Menu,
  X,
  Pin,
  PinOff,
  MoreHorizontal,
  Trash2,
  Pencil,
} from "lucide-react";


const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

const WELCOME_CARDS = [
  {
    text: "Search the web for latest AI agent news.",
    label: "\ud83d\udd0d Search latest web info",
    icon: Search,
  },
  {
    text: "Summarize the document I uploaded.",
    label: "\ud83d\udcc4 Analyze documents",
    icon: FileText,
  },
  {
    text: "Remember that my channel name is dswithbappy.",
    label: "\ud83e\udde0 Save memory",
    icon: Brain,
  },
  {
    text: "Calculate 125 * 48 / 6",
    label: "\ud83e\uddee Run calculations",
    icon: Calculator,
  },
];


function detectLikelyTool(message) {
  const text = message.toLowerCase();
  const mathPattern =
    /(\d+\s*[\+\-\*\/]\s*\d+)|calculate|calculation|math|solve/;
  const ragPattern =
    /document|pdf|file|uploaded|summarize|summary|according to|based on/;
  const memorySavePattern =
    /remember that|save this|store this|keep in memory|memorize/;
  const memoryRecallPattern =
    /what do you remember|recall|my memory|remember about me/;
  const webSearchPattern =
    /latest|current|today|now|recent|news|search web|web search|internet|online|price|version|update|2025|2026|who is|what is happening|trending|release|new model|current ceo|latest version/;

  if (memorySavePattern.test(text)) return "Memory Save";
  if (memoryRecallPattern.test(text)) return "Memory Recall";
  if (ragPattern.test(text)) return "Document Search";
  if (webSearchPattern.test(text)) return "Web Search";
  if (mathPattern.test(text)) return "Calculator";
  return null;
}

function parseSSEPart(part) {
  const lines = part
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("data:"));
  if (lines.length === 0) return null;

  const jsonText = lines
    .map((line) => line.replace(/^data:\s*/, ""))
    .join("\n")
    .trim();

  if (!jsonText || jsonText === "[DONE]") return null;

  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

export default function ChatSection() {
  const [threadId, setThreadId] = useState(() => {
    let id = localStorage.getItem("thread_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("thread_id", id);
    }
    return id;
  });

  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem("selected_model") || "gemini-2.5-flash";
  });

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState("Ready");
  const [notice, setNotice] = useState(
    "VIVGPT can make mistakes. Check important info."
  );
  const [isSending, setIsSending] = useState(false);
  const [toolProgress, setToolProgress] = useState(null);
  const [isDictating, setIsDictating] = useState(false);

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

  const sparkSeed = useMemo(() => Math.random(), []);

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
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

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, toolProgress, scrollToBottom]);

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch("/conversations");
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }, []);

  const loadConversation = useCallback(
    async (selectedThreadId) => {
      setThreadId(selectedThreadId);
      localStorage.setItem("thread_id", selectedThreadId);

      try {
        const response = await fetch(`/history/${selectedThreadId}`);
        const data = await response.json();

        if (!data.messages || data.messages.length === 0) {
          setMessages([]);
          setShowWelcome(true);
        } else {
          setMessages(data.messages);
          setShowWelcome(false);
        }

        await loadConversations();
      } catch (error) {
        console.error("Failed to load conversation:", error);
      }
    },
    [loadConversations]
  );

  useEffect(() => {
    loadConversations();
    loadConversation(threadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModelChange = (e) => {
    const model = e.target.value;
    setSelectedModel(model);
    localStorage.setItem("selected_model", model);
    setNotice(`Selected model: ${model}`);
  };

  const autoResize = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const usePrompt = (text) => {
    setInputValue(text);
    if (textareaRef.current) {
      autoResize(textareaRef.current);
      textareaRef.current.focus();
    }
  };

  const stopDictation = useCallback(() => {
    setIsDictating(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    setStatus("Ready");
    setNotice("VIVGPT can make mistakes. Check important info.");
  }, []);

  const setupSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const speechRecognition = new SpeechRecognition();
    speechRecognition.lang = "en-US";
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;

    speechRecognition.onstart = () => {
      setIsDictating(true);
      setStatus("Listening...");
    };

    speechRecognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setInputValue((prev) => {
          const trimmed = prev.trim();
          return trimmed
            ? trimmed + " " + finalTranscript.trim()
            : finalTranscript.trim();
        });
        if (textareaRef.current) autoResize(textareaRef.current);
      }

      if (interimTranscript) {
        setNotice("Listening: " + interimTranscript);
      }
    };

    speechRecognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        alert("Microphone permission denied. Please allow microphone access.");
      }
      stopDictation();
    };

    speechRecognition.onend = () => {
      if (recognitionRef.current?._isActive) {
        try {
          speechRecognition.start();
        } catch {
          stopDictation();
        }
      }
    };

    return speechRecognition;
  }, [stopDictation]);

  const toggleDictation = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = setupSpeechRecognition();
    }
    if (!recognitionRef.current) {
      alert(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    if (isDictating) {
      recognitionRef.current._isActive = false;
      stopDictation();
    } else {
      recognitionRef.current._isActive = true;
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Could not start dictation:", error);
      }
    }
  };

  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message || isSending) return;

    if (isDictating) stopDictation();

    setShowWelcome(false);
    setIsSending(true);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg = { role: "user", content: message };
    const assistantMsg = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    setStatus(`Thinking with ${selectedModel}...`);

    const likelyTool = detectLikelyTool(message);
    if (likelyTool) {
      setToolProgress({ name: likelyTool, done: false });
      setStatus(`Using ${likelyTool}...`);
    }

    let firstTokenReceived = false;

    const updateAssistant = (token) => {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === "assistant") {
          updated[updated.length - 1] = {
            ...last,
            content: last.content + token,
          };
        }
        return updated;
      });
    };

    const handleStreamData = (data) => {
      if (!data) return;

      if (data.token !== undefined && data.token !== null) {
        if (!firstTokenReceived) {
          firstTokenReceived = true;
          if (likelyTool) {
            setToolProgress({ name: likelyTool, done: true });
          }
          setStatus(`Generating with ${selectedModel}...`);
        }
        updateAssistant(data.token);
      }

      if (data.error) {
        if (likelyTool) setToolProgress({ name: likelyTool, done: true });
        updateAssistant("\n\nError: " + data.error);
        setStatus("Ready");
      }

      if (data.done) {
        if (likelyTool && !firstTokenReceived) {
          setToolProgress({ name: likelyTool, done: true });
        }
        setStatus("Ready");
      }
    };

    try {
      const response = await fetch("/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          thread_id: threadId,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        let errorText = "Request failed.";
        try {
          const errorData = await response.json();
          errorText = errorData.detail || errorData.message || errorText;
        } catch {
          /* ignore */
        }
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            updated[updated.length - 1] = { ...last, content: errorText };
          }
          return updated;
        });
        return;
      }

      if (!response.body) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              content: "Streaming is not supported by this browser.",
            };
          }
          return updated;
        });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split(/\r?\n\r?\n/);
        buffer = parts.pop() || "";

        for (const part of parts) {
          handleStreamData(parseSSEPart(part));
        }
      }

      buffer += decoder.decode();
      if (buffer.trim()) {
        handleStreamData(parseSSEPart(buffer));
      }
    } catch (error) {
      if (likelyTool) setToolProgress({ name: likelyTool, done: true });
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === "assistant") {
          updated[updated.length - 1] = {
            ...last,
            content: "Something went wrong: " + error.message,
          };
        }
        return updated;
      });
    } finally {
      setIsSending(false);
      setToolProgress(null);
      setStatus("Ready");
      textareaRef.current?.focus();
      await loadConversations();
    }
  };

  const uploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowWelcome(false);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `📎 Uploaded document: ${file.name}` },
    ]);

    setToolProgress({ name: "Document Ingestion", done: false });
    setStatus("Using Document Ingestion...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("thread_id", threadId);

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      setToolProgress({ name: "Document Ingestion", done: true });

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.message +
              "\n\nYou can now ask questions about this document.",
          },
        ]);
        await loadConversations();
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Upload failed: " + data.message },
        ]);
      }
    } catch (error) {
      setToolProgress({ name: "Document Ingestion", done: true });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Upload failed: " + error.message },
      ]);
    }

    setStatus("Ready");
    setToolProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const newChat = async () => {
    const newId = crypto.randomUUID();
    setThreadId(newId);
    localStorage.setItem("thread_id", newId);
    if (isDictating) stopDictation();
    setMessages([]);
    setShowWelcome(true);
    await loadConversations();
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
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

      // If deleted chat was active, switch to next available
      if (deleteConfirmThread === threadId) {
        const remaining = conversations.filter(
          (c) => c.thread_id !== deleteConfirmThread
        );
        if (remaining.length > 0) {
          await loadConversation(remaining[0].thread_id);
        } else {
          // No chats left — create a new one
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

    // Sort each group by updated_at descending
    const sortByDate = (a, b) => new Date(b.updated_at) - new Date(a.updated_at);
    pinned.sort(sortByDate);
    unpinned.sort(sortByDate);

    return [...pinned, ...unpinned];
  }, [conversations, pinnedThreads, searchQuery]);

  return (
    <motion.section
      id="vivgpt-chat"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
