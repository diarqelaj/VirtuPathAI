'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Bot } from 'lucide-react';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchWebsiteContent = async () => {
      try {
        const res = await fetch('/api/website-content');
        const data = await res.json();
        // Append website content to the system message after fetching
        setMessages([
          {
            role: 'system',
            content: `You are a helpful assistant. Here is some context about the website: ${data.content}`,
          },
        ]);
      } catch (error) {
        console.error('❌ Failed to fetch website content:', error);
        setMessages([
          {
            role: 'system',
            content: 'I could not fetch the website content. Please try again later.',
          },
        ]);
      }
    };

    fetchWebsiteContent();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      setMessages([...newMessages, { role: 'assistant', content: data.reply || 'Something went wrong.' }]);
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

  return (
    <div>
      {/* Floating button */}
      {!open && (
        <button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 p-4 bg-gradient-to-br from-purple-600 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50 ring-2 ring-white/20 focus:ring-4 focus:ring-blue-300"
        >
          <Bot size={24} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-4 right-4 w-80 h-[450px] bg-white/10 backdrop-blur-lg border border-purple-600 rounded-lg flex flex-col z-50">
          <div className="flex justify-between items-center p-3 border-b border-purple-400">
            <h2 className="text-sm font-semibold text-white">AI Chatbot</h2>
            <button onClick={toggleChat}>
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm custom-scrollbar">
            {messages
              .filter((m) => m.role !== 'system')
              .map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-blue-500 text-white self-end'
                      : 'bg-gray-800 text-white self-start'
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
              ))}
            {loading && <p className="text-gray-400 italic">Thinking...</p>}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-purple-400 bg-white/5">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/50 border border-white/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                placeholder="Type your question..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-gradient-to-br from-purple-600 to-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
