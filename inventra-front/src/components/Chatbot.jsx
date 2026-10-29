import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, X, Send, Sparkles, Trash2, Bot, User,
  ChevronDown, ArrowUpRight, Loader2
} from 'lucide-react';
import { chatService } from '../services/chatService';

const starterQuestions = [
  "Which products are running low?",
  "What products should I reorder today?",
  "Which products are fast moving?",
  "Which products are slow moving?",
  "Show critical stock items",
  "Which supplier has the shortest lead time?",
  "Summarize my inventory health",
  "What is next week's predicted demand?"
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your **Inventra AI Retail Assistant**.\nI analyze live store inventory, demand forecasts, supplier performance, and procurement risks.\nHow can I help optimize your retail operations today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('inventra_chat_session') || null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (messageToSend) => {
    const text = (messageToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await chatService.sendMessage(text, sessionId);
      if (res.session_id) {
        setSessionId(res.session_id);
        localStorage.setItem('inventra_chat_session', res.session_id);
      }
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: res.reply,
          data: res.data,
          generatedBy: res.generated_by
        }
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "I encountered a connection issue reaching the retail intelligence engine. Please ensure the backend is running."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (sessionId) {
      try {
        await chatService.clearHistory(sessionId);
      } catch {
        // ignore
      }
    }
    setMessages([
      {
        role: 'assistant',
        content: "Conversation history cleared. How can I assist you with your store inventory and forecasts?"
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 text-white shadow-xl shadow-sky-600/30 hover:scale-105 active:scale-95 transition-all duration-200"
          title="Open Inventra AI Assistant"
        >
          <div className="relative w-6 h-6 rounded-full bg-white p-0.5 shadow-xs flex items-center justify-center">
            <img src="/logo_icon.png" alt="Inventra AI" className="w-full h-full object-contain" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
          </div>
          <span className="text-xs font-black tracking-wide">Inventra AI</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[580px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
                <img src="/logo_icon.png" alt="Inventra AI" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  Inventra AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h3>
                <p className="text-[10px] text-sky-200/80 font-medium">
                  Powered by Local Ollama &amp; Real-Time Store DB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-white/10 text-sky-200 transition-colors"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-sky-200 transition-colors"
                title="Minimize Chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Suggestions:
            </span>
            {starterQuestions.slice(0, 5).map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 hover:text-sky-700 hover:border-sky-200 transition-all shadow-2xs whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-white border border-sky-100 p-0.5 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    <img src="/logo_icon.png" alt="AI" className="w-full h-full object-contain" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-sky-600 to-teal-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {m.generatedBy && (
                    <div className="mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Source: {m.generatedBy}</span>
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start items-center text-slate-400 text-xs">
                <div className="w-7 h-7 rounded-xl bg-white border border-sky-100 p-0.5 shadow-2xs flex items-center justify-center shrink-0">
                  <img src="/logo_icon.png" alt="AI" className="w-full h-full object-contain" />
                </div>
                <div className="flex items-center gap-1.5 p-2.5 bg-white border border-slate-200/80 rounded-2xl rounded-bl-xs shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                  <span className="text-[11px] text-slate-500 font-medium">Analyzing retail records...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about inventory, sales, suppliers..."
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 disabled:opacity-50 text-white transition-all shadow-xs"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
