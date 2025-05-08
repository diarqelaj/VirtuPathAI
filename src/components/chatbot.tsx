'use client';
import { useState, useEffect, useRef } from 'react';
import { X, Bot, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import ReactMarkdown from 'react-markdown';


export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showScrollNote, setShowScrollNote] = useState(false);
  const [hasShownScrollNote, setHasShownScrollNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchWebsiteContent = async () => {
      try {
        const res = await fetch('/api/website-content');
        const data = await res.json();
        setMessages([
          {
            role: 'system',
            content: `You are a helpful assistant. Here is some context about the website: ${data.content}`,
          },
          {
            role: 'assistant',
            content: `👋 Hi there! I'm **VirtuPath AI**, your smart assistant.\n\nI can help you explore career paths, answer questions, and guide you through our platform.\n\nHow can I help you today?`,
          },
        ]);
      } catch (error) {
        console.error('❌ Failed to fetch website content:', error);
        setMessages([
          {
            role: 'system',
            content: 'I could not fetch the website content. Please try again later.',
          },
          {
            role: 'assistant',
            content: `👋 Hi! I'm **VirtuPath AI**. Let me know how I can help you get started.`,
          },
        ]);
      }
    };
    fetchWebsiteContent();
  }, []);
  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasShownScrollNote && !open) {
        setShowScrollNote(true);
        setHasShownScrollNote(true);
        setTimeout(() => setShowScrollNote(false), 5000);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasShownScrollNote, open]);

  const toggleChat = () => setOpen((prev) => !prev);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      let reply = data.reply || '';

      setMessages([...newMessages, { role: 'assistant', content: reply.trim() || '...' }]);
    } catch (err) {
      console.error('❌ Failed to get response from /api/chat:', err);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiSelect = (emojiObject: any) => {
    setInput((prev) => prev + emojiObject.emoji);
    setShowEmojis(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const renderContent = (content: string) => {
    const parts = content.split(/(◁think▷[\s\S]*?◁\/think▷)/gi);

    return parts.map((part, i) => {
      if (part.startsWith('◁think▷')) {
        const thought = part.replace('◁think▷', '').replace('◁/think▷', '').trim();
        return (
          <div key={i} className="text-white/50 text-xs italic mb-1 whitespace-pre-wrap">
            {thought}
          </div>
        );
      } else {
        return (
          <ReactMarkdown
            key={i}
            components={{
              p: ({ children }) => (
                <p className="whitespace-pre-wrap leading-relaxed">{children}</p>
              ),
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              ul: ({ children }) => <ul className="list-disc ml-5">{children}</ul>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              a: ({ href, children }) => (
                <a
                  href={href || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  {children}
                </a>
              ),
            }}
          >
            {part}
          </ReactMarkdown>

        );
      }
    });
  };

  return (
    <>
      {showScrollNote && !open && (
        <div className="fixed bottom-24 right-4 bg-[#111325] text-white text-sm px-4 py-2 rounded-xl shadow-lg z-40 animate-fadeInUp">
          👋 Need help? Chat with VirtuPath AI.
        </div>
      )}

      {!open && (
        <button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 p-4 bg-gradient-to-br from-purple-600 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50 ring-2 ring-white/20 focus:ring-4 focus:ring-blue-300"
        >
          <Bot size={24} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 w-96 h-[580px] bg-[#040720] border border-[#2a2a3b] rounded-2xl flex flex-col z-50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-[#33374d] bg-[#0a0c1c]">
            <div className="flex items-center gap-2 text-white font-semibold text-base">
              <Bot className="w-5 h-5 text-purple-400" />
              VirtuPath AI
            </div>
            <button onClick={toggleChat}>
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm custom-scrollbar">
            {messages
              .filter((m) => m.role !== 'system')
              .map((msg, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-3 rounded-2xl max-w-[85%] text-[0.95rem] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-blue-500 text-white self-end ml-auto'
                      : 'bg-[#1a1d33] text-white self-start mr-auto'
                  }`}
                >
                  {renderContent(msg.content)}
                </div>
              ))}

            {loading && (
              <div className="flex items-center gap-2 self-start mr-auto px-5 py-3 rounded-2xl bg-[#12152b] max-w-fit">
                <span className="dot w-3.5 h-3.5 bg-white/80 rounded-full animate-bounce" />
                <span className="dot w-3.5 h-3.5 bg-white/80 rounded-full animate-bounce delay-[0.15s]" />
                <span className="dot w-3.5 h-3.5 bg-white/80 rounded-full animate-bounce delay-[0.3s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input + Emoji */}
          <div className="relative p-4 border-t border-[#2a2a3b] bg-[#0a0c1c]">
            {showEmojis && (
              <div className="absolute bottom-[70px] right-3 z-50">
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </div>
            )}
            <div className="flex gap-3 items-center">
              <button onClick={() => setShowEmojis((prev) => !prev)}>
                <Smile className="text-white hover:text-purple-400 w-6 h-6" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-[#0d0f21] text-white placeholder-white/40 border border-[#2a2a3b] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-gradient-to-br from-blue-700 to-purple-600 text-white px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:scale-105"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
