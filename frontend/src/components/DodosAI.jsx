import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaTimes, FaMinus, FaMicrophone, FaRegLightbulb, FaTools, FaMobileAlt } from 'react-icons/fa';
import { aiAPI } from '../services/api';
import { toast } from 'react-toastify';

const DodosAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', content: 'Hello! I am DODOS ELECTRO AI. How can I help you with your phone repair or parts today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage('');
    
    // Add user message to UI immediately
    const updatedHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(updatedHistory);
    setLoading(true);

    try {
      // History for Gemini excluding the first welcome message if needed, 
      // but usually better to include it for context.
      const res = await aiAPI.chat(userMessage, chatHistory);
      
      if (res.data.success) {
        setChatHistory(prev => [...prev, { role: 'model', content: res.data.reply }]);
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      const errorMsg = err.response?.data?.message || 'AI is currently offline. Please try again later.';
      toast.error(errorMsg);
      setChatHistory(prev => [...prev, { role: 'model', content: `Sorry, I encountered an error: ${errorMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    { icon: <FaTools />, text: "Diagnose my phone" },
    { icon: <FaMobileAlt />, text: "Find iPhone screen" },
    { icon: <FaRegLightbulb />, text: "Repair cost?" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center relative group"
        >
          <div className="absolute inset-0 bg-blue-600 rounded-2xl animate-ping opacity-20 group-hover:opacity-40" />
          <FaRobot size={28} className="relative z-10" />
          <span className="absolute -top-2 -right-2 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[380px] sm:w-[420px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-blue-600 p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaRobot size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-tighter">DODOS ELECTRO AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Online Assistant</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                  <FaMinus size={12} />
                </button>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors text-white/60 hover:text-white">
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 scroll-smooth"
            >
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {chatHistory.length === 1 && !loading && (
              <div className="px-6 py-2 flex gap-2 overflow-x-auto hide-scrollbar">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(s.text)}
                    className="flex-shrink-0 flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-all shadow-sm"
                  >
                    {s.icon} {s.text}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100">
              <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me about repair or products..."
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all pr-12"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || loading}
                  className="absolute right-2 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:bg-gray-400 transition-all shadow-lg shadow-blue-500/20"
                >
                  <FaPaperPlane size={14} />
                </button>
              </form>
              <p className="text-[9px] text-center text-gray-400 mt-4 font-bold uppercase tracking-widest">Powered by DODOS AI • ChatGPT</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DodosAI;
