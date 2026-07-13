import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
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
    label: "🔍 Search latest web info",
    icon: Search,
  },
  {
    text: "Summarize the document I uploaded.",
    label: "📄 Analyze documents",
    icon: FileText,
  },
  {
    text: "Remember that my channel name is dswithbappy.",
    label: "🧠 Save memory",
    icon: Brain,
  },
  {
    text: "Calculate 125 * 48 / 6",
    label: "🧮 Run calculations",
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

  const sparkSeed = useMemo(() => Math.random(), []);

  const chatContainerRef = useRef(null);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

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

  return (
    <motion.section
      id="vivgpt-chat"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background */}
      <div className="gradient-mesh absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.20),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(56,189,248,0.15),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.12),transparent_50%)]" />

      {/* Animated gradient blobs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 top-16 h-96 w-96 rounded-full bg-violet-600/10 blur-[90px]"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-sky-400/8 blur-[85px]"
      />
      <motion.div
        animate={{ opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[80px]"
      />

      {/* Floating background particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={`${sparkSeed}-${i}`}
          className="absolute h-1 w-1 rounded-full bg-white/20"
          style={{ left: `${(i * 7 + sparkSeed * 100) % 100}%`, top: `${(i * 13 + sparkSeed * 100) % 100}%` }}
          animate={{ y: [0, -36 - (i % 7) * 6, 0], opacity: [0.05, 0.7, 0.05] }}
          transition={{
            duration: 9 + (i % 5),
            repeat: Infinity,
            delay: (i % 6) * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative flex h-screen overflow-hidden">

        {/* Sidebar */}
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
        </aside>

        {/* Main chat area */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-white/10 bg-[rgba(5,8,22,0.7)] px-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="text-lg font-bold">
                <span className="bg-gradient-to-r from-white via-violet-200 to-sky-200 bg-clip-text text-transparent">
                  Agentic AI Chatbot
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
              <span className="relative flex items-center gap-2">
                <span className="relative inline-flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70"
                    style={{ animationDuration: "1.5s" }}
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-neutral-200">{status === "Ready" ? " Ready" : status}</span>
              </span>
            </div>
          </div>


          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-5 py-8 pb-44"
          >
            {showWelcome && messages.length === 0 && (
              <>
                <div className="mx-auto mt-12 max-w-3xl text-center md:mt-16">
                  <div className="relative mx-auto mb-6 h-24 w-full max-w-xl">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6 }}
                      className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-violet-500/30 via-sky-400/20 to-emerald-400/10 blur-[2px]"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      className="relative mx-auto h-24 w-24 rounded-full bg-violet-500/10 ring-1 ring-violet-400/20"
                    >
                      <div className="absolute inset-2 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.35),rgba(139,92,246,0.45),rgba(56,189,248,0.15))]" />
                      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-[1px]" />
                    </motion.div>
                  </div>

                  <h2 className="mb-3 text-4xl font-semibold tracking-tight text-white">
                    Your AI Agent is Ready
                  </h2>
                  <p className="mx-auto max-w-2xl text-neutral-400">
                    Ask questions, analyze documents, search the web and automate tasks.
                  </p>
                </div>

                <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                  {WELCOME_CARDS.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <motion.button
                        key={card.label}
                        type="button"
                        onClick={() => usePrompt(card.text)}
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-sm text-neutral-300 backdrop-blur transition hover:border-white/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-400/15 ring-1 ring-white/10">
                            <Icon className="h-4 w-4 text-violet-300" />
                          </div>
                          <div className="font-medium text-neutral-100 group-hover:text-white">
                            {card.label}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

              </>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`mx-auto mb-7 flex max-w-3xl gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-sky-400 shadow-[0_0_30px_rgba(139,92,246,0.25)]">
                    <span className="text-xs font-bold text-white">AI</span>
                  </div>
                )}

                <div
                  className={`max-w-[75%] whitespace-pre-wrap break-words text-base leading-relaxed ${
                  msg.role === "user"
                      ? "rounded-2xl border border-white/10 bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-white shadow-[0_0_40px_rgba(139,92,246,0.20)]"
                      : "rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-neutral-100"
                  }`}
                >
                  {String(msg.content)
                    .replace(/\*\*(.*?)\*\*/g, "$1")
                    .replace(/(^|\n)\s*[-*]\s+/g, "$1")
                    .replace(/(^|\n)\s*#{1,6}\s+/g, "$1")
                    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-sky-400/20 ring-1 ring-white/10">
                    <span className="text-xs font-bold text-white">U</span>
                  </div>
                )}

              </motion.div>
            ))}

            {toolProgress && (
              <div className="mx-auto mb-4 flex max-w-3xl justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-neutral-300 backdrop-blur shadow-[0_0_35px_rgba(16,185,129,0.10)]">
                  {toolProgress.done ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  )}
                  {toolProgress.done
                    ? `${toolProgress.name} completed`
                    : `Using ${toolProgress.name}...`}
                </div>
              </div>
            )}

          </div>

          {/* Input area */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-10 md:left-[270px]">
            <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-3xl border border-white/10 bg-white/[0.06] p-3 shadow-[0_0_60px_rgba(139,92,246,0.10)] backdrop-blur-xl">

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,.md,.py,.csv"
                onChange={uploadFile}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload document"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-neutral-400 transition hover:bg-white/10 hover:text-white"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  autoResize(e.target);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className="max-h-40 min-h-[30px] flex-1 resize-none bg-transparent py-2 text-base text-neutral-100 outline-none placeholder:text-neutral-500"
              />

              <select
                value={selectedModel}
                onChange={handleModelChange}
                title="Select model"
                className="h-10 max-w-[135px] flex-shrink-0 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-2 text-xs text-neutral-200 outline-none"
              >
                {MODELS.map((m) => (
                  <option key={m} value={m} className="bg-[#171717]">
                    {m}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={toggleDictation}
                title="Dictate"
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition ${
                  isDictating
                    ? "bg-red-500 text-white"
                    : "text-neutral-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isDictating ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>

              <button
                type="button"
                onClick={sendMessage}
                disabled={isSending}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-400 text-white shadow-[0_0_60px_rgba(139,92,246,0.35)] transition hover:scale-110 disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
              </button>

            </div>

            <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-neutral-500">
              {notice}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
