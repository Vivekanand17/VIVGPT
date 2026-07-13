import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Paperclip,
  Mic,
  MicOff,
  Send,
  Plus,
  Loader2,
  Check,
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
    label: "Search latest web info",
  },
  {
    text: "Summarize the document I uploaded.",
    label: "Summarize uploaded document",
  },
  {
    text: "Remember that my channel name is dswithbappy.",
    label: "Save something to memory",
  },
  {
    text: "Calculate 125 * 48 / 6",
    label: "Use calculator tool",
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
      className="relative min-h-screen bg-[#0B0F14]"
    >
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-[270px] flex-shrink-0 flex-col border-r border-white/5 bg-[#050505] p-3 md:flex">
          <div className="px-3 py-3 text-lg font-bold text-white">VIVGPT</div>

          <button
            type="button"
            onClick={newChat}
            className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-left text-sm text-neutral-300 transition hover:bg-white/5"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>

          <div className="mb-2 px-1 text-xs text-neutral-500">Recent Chats</div>
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
                      ? "bg-white/10 text-white"
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
          <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-white/5 px-6">
            <div className="text-base font-semibold text-white">
              Agentic AI Chatbot
            </div>
            <div className="text-sm text-neutral-400">{status}</div>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-5 py-8 pb-44"
          >
            {showWelcome && messages.length === 0 && (
              <>
                <div className="mx-auto mt-16 max-w-2xl text-center md:mt-24">
                  <h2 className="mb-3 text-3xl font-semibold text-white">
                    How can I help you today?
                  </h2>
                  <p className="text-neutral-400">
                    Ask questions, upload documents, use tools, search the web,
                    and chat with memory.
                  </p>
                </div>

                <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                  {WELCOME_CARDS.map((card) => (
                    <button
                      key={card.label}
                      type="button"
                      onClick={() => usePrompt(card.text)}
                      className="rounded-2xl border border-white/10 p-4 text-left text-sm text-neutral-300 transition hover:border-white/20 hover:bg-white/5"
                    >
                      {card.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mx-auto mb-7 flex max-w-3xl gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[75%] whitespace-pre-wrap break-words text-base leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-2xl rounded-br-sm border border-white/10 bg-white/10 px-4 py-3 text-neutral-100"
                      : "text-neutral-200"
                  }`}
                >
                  {String(msg.content)
                    .replace(/\*\*(.*?)\*\*/g, "$1")
                    .replace(/(^|\n)\s*[-*]\s+/g, "$1")
                    .replace(/(^|\n)\s*#{1,6}\s+/g, "$1")
                    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                    U
                  </div>
                )}
              </div>
            ))}

            {toolProgress && (
              <div className="mx-auto mb-4 flex max-w-3xl justify-start">
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300">
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
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/95 to-transparent px-5 pb-6 pt-8 md:left-[270px]">
            <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-lg backdrop-blur-xl">
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
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-black transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:bg-neutral-600 disabled:text-neutral-400"
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
