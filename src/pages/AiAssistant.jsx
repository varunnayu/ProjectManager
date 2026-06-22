import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSendPlane2Line,
  RiSettings3Line,
  RiCpuLine,
  RiTerminalBoxLine,
  RiCheckboxCircleLine,
  RiFileTextLine,
  RiSparklingLine,
  RiCloseLine,
  RiUser3Line,
  RiRobotLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import { OpenAiService } from "../services/openAiService";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

// Reuse regex markdown parsing
const parseMarkdown = (text) => {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks: ```js ... ```
  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre class="bg-gray-950 p-3 rounded-lg border border-gray-800 font-mono text-[10px] text-indigo-300 my-2 overflow-x-auto whitespace-pre">$1</pre>'
  );

  // Inline code: `code`
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-950 px-1 py-0.5 rounded font-mono text-xs text-indigo-400">$1</code>'
  );

  // Headers: # H1, ## H2, ### H3
  html = html.replace(
    /^# (.*?)$/gm,
    '<h1 class="text-base font-extrabold border-b border-gray-800/80 pb-1 mt-3 mb-2 text-white font-display">$1</h1>'
  );
  html = html.replace(
    /^## (.*?)$/gm,
    '<h2 class="text-sm font-bold mt-3 mb-1 text-white font-display">$1</h2>'
  );
  html = html.replace(
    /^### (.*?)$/gm,
    '<h3 class="text-xs font-bold mt-2 mb-1 text-white font-display">$1</h3>'
  );

  // Bold: **bold**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

  // Italic: *italic*
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-300">$1</em>');

  // Lists: - item or * item
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li class="list-disc ml-4 my-0.5 text-gray-300">$1</li>');

  // Paragraph breaks
  html = html.replace(/\n\n/g, '<p class="my-1.5"></p>');

  return html;
};

const QUICK_PROMPTS = [
  {
    title: "Where did I stop?",
    icon: <RiTerminalBoxLine className="text-indigo-400" />,
    desc: "Loads latest completed work and blockers from Dev Logs.",
  },
  {
    title: "What should I work on next?",
    icon: <RiCheckboxCircleLine className="text-amber-400" />,
    desc: "Analyzes pending task weights to compile daily plan items.",
  },
  {
    title: "Summarize current project",
    icon: <RiCpuLine className="text-emerald-400" />,
    desc: "Summarizes timeline, progress metrics, and scoped docs.",
  },
  {
    title: "Generate tasks from notes",
    icon: <RiFileTextLine className="text-cyan-400" />,
    desc: "Inspects documentation guidelines to extract checklists.",
  },
];

export default function AiAssistant() {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I'm your ProjectVault AI workspace companion! Ask me details about projects progress, what tasks you should tackle next, or stopping checkpoints. I automatically analyze your workspace data.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  // Key configurations
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef(null);

  // Load API key from storage
  useEffect(() => {
    const saved = localStorage.getItem("pv_openai_key") || "";
    setApiKey(saved);
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem("pv_openai_key", apiKey.trim());
    addToast({ message: apiKey.trim() ? "OpenAI API Key saved." : "Key cleared, running locally.", type: "success" });
    setShowSettings(false);
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    // Append user message
    const userMsg = { id: Date.now().toString(), role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      // Map history payload
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await OpenAiService.ask(query, history, user?.uid || "mock-user-123");

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: response },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `❌ **API Request Failed:** ${err.message || "An authentication error occurred. Please verify your API key configuration."}`,
        },
      ]);
      addToast({ message: "AI Request encountered an error.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Workspace indexes loaded. Ask me questions about your workspace projects, notes, and checklist tasks.",
      },
    ]);
    addToast({ message: "Chat logs cleared.", type: "success" });
  };

  return (
    <div className="space-y-6 flex flex-col min-h-[80vh]">
      {/* Header Panel */}
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <RiSparklingLine className="text-indigo-400 animate-pulse" />
            AI Assistant
          </h1>
          <p className="page-subtitle text-sm text-gray-400">
            Ask context questions about your files. Runs locally or links to OpenAI.
          </p>
        </div>

        {/* API Settings dropdown button */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className={`badge text-[10px] uppercase font-bold tracking-wider ${
              apiKey ? "badge-emerald" : "badge-indigo"
            }`}>
              {apiKey ? "OpenAI GPT-4o Mode" : "Workspace Engine (Local)"}
            </span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="btn btn-secondary btn-sm p-2"
              title="OpenAI API Configuration"
            >
              <RiSettings3Line className="text-base" />
            </button>
          </div>

          <AnimatePresence>
            {showSettings && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSettings(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  className="absolute right-0 mt-2 w-72 z-20 rounded-xl bg-gray-950 border border-gray-800 p-4 shadow-2xl space-y-3 text-left"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Configure API Keys</h3>
                    <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white">
                      <RiCloseLine />
                    </button>
                  </div>
                  <form onSubmit={handleSaveKey} className="space-y-2.5">
                    <p className="text-[10px] text-gray-400 leading-normal">
                      Provide a custom OpenAI API Key. It is stored locally in your browser. Leaving it blank defaults to a mock workspace query fallback.
                    </p>
                    <input
                      type="password"
                      placeholder="sk-proj-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="input text-xs"
                    />
                    <button type="submit" className="btn btn-primary btn-sm w-full py-1.5">
                      Save Key
                    </button>
                  </form>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>      {/* Main Workspace: Chat panel */}
      <div className="glass-card flex flex-col justify-between h-auto lg:h-[calc(100vh-220px)] lg:min-h-[550px] overflow-hidden flex-1">
        {/* Messages stack */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              const isWelcome = msg.id === "welcome";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col space-y-4"
                >
                  <div className={`flex gap-3 max-w-[85%] ${isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                    {/* Avatar indicator */}
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${
                      isAssistant
                        ? "bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/10"
                        : "bg-gray-800"
                    }`}>
                      {isAssistant ? <RiRobotLine className="text-sm" /> : <RiUser3Line className="text-sm" />}
                    </div>

                    {/* Speech bubble */}
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
                      isAssistant
                        ? "bg-gray-900/40 border-gray-800/80 text-gray-300 rounded-tl-sm"
                        : "bg-indigo-600 border-indigo-500 text-white rounded-tr-sm"
                    }`}>
                      {isAssistant ? (
                        <div
                          className="markdown-bubble"
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                        />
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>

                  {/* Render Quick Prompts in the welcome bubble area if it's the welcome message and no other messages are sent */}
                  {isWelcome && messages.length === 1 && (
                    <div className="pl-11 pr-4 pt-2">
                      <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                        Quick Suggestions
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
                        {QUICK_PROMPTS.map((prompt) => (
                          <button
                            key={prompt.title}
                            onClick={() => handleSendMessage(prompt.title)}
                            disabled={loading}
                            className="glass-card p-4 text-left hover:border-indigo-500 hover:bg-indigo-500/5 transition-all flex flex-col justify-between items-start cursor-pointer group disabled:opacity-40 h-full min-h-[120px]"
                          >
                            <div className="flex justify-between items-center w-full mb-2">
                              <span className="text-lg p-1.5 rounded bg-gray-950 group-hover:bg-indigo-500/10 transition-colors">
                                {prompt.icon}
                              </span>
                              <span className="text-[9px] uppercase font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                Run →
                              </span>
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-white leading-snug">{prompt.title}</h4>
                              <p className="text-[10px] text-gray-500 leading-normal">{prompt.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Thinking loader */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 max-w-[80%] mr-auto"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 text-white">
                  <RiRobotLine className="text-sm" />
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-900/40 border border-gray-800/80 text-xs text-gray-400 flex items-center gap-2 rounded-tl-sm">
                  <div className="spinner border-2" style={{ width: "12px", height: "12px" }} />
                  Assistant is analyzing workspace documents...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom input area */}
        <div className="p-4 border-t border-gray-900 flex flex-col md:flex-row gap-3 items-center flex-shrink-0">
          <button
            onClick={clearChat}
            className="btn btn-secondary p-2.5 text-gray-500 hover:text-rose-400 hover:bg-rose-950/20 hover:border-rose-900/30 transition-colors"
            title="Clear Conversation History"
          >
            <RiDeleteBinLine className="text-base" />
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex-1 flex gap-2 w-full"
          >
            <input
              type="text"
              placeholder="Ask assistant questions about tasks status or milestones..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input flex-1"
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary px-5" disabled={loading}>
              <RiSendPlane2Line />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
