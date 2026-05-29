import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaCommentDots, FaUserCircle, FaPaperPlane,
  FaBox, FaCheck, FaCheckDouble, FaWhatsapp,
  FaReply, FaEdit, FaTrash, FaTimes, FaInbox
} from 'react-icons/fa';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

const ChatManagement = () => {
  const { user }    = useAuth();
  const { theme }   = useTheme();
  const isDark      = theme === 'Dark';

  const [conversations, setConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages]           = useState([]);
  const [inputText, setInputText]         = useState('');
  const [replyingTo, setReplyingTo]       = useState(null);
  const [editingMsg, setEditingMsg]       = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // ── Fetch conversations every 10s ──
  useEffect(() => {
    fetchConversations();
    const id = setInterval(fetchConversations, 10000);
    return () => clearInterval(id);
  }, []);

  // ── Fetch messages every 5s when a contact is selected ──
  useEffect(() => {
    if (!activeContact) return;
    fetchMessages(activeContact._id);
    const id = setInterval(() => fetchMessages(activeContact._id), 5000);
    return () => clearInterval(id);
  }, [activeContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeContact) setTimeout(() => inputRef.current?.focus(), 200);
  }, [activeContact]);

  const fetchConversations = async () => {
    try {
      const res = await chatAPI.getConversations();
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const res = await chatAPI.getConversation(contactId);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact) return;
    try {
      if (editingMsg) {
        const res = await chatAPI.editMessage(editingMsg._id, inputText);
        setMessages(prev => prev.map(m => m._id === editingMsg._id ? res.data.message : m));
        setEditingMsg(null);
        setInputText('');
      } else {
        const res = await chatAPI.sendMessage({
          receiverId: activeContact._id,
          text: inputText.trim(),
          replyTo: replyingTo?._id || null,
        });
        setMessages(prev => [...prev, res.data.message]);
        setInputText('');
        setReplyingTo(null);
        fetchConversations();
      }
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleDelete = async (messageId) => {
    try {
      const res = await chatAPI.deleteMessage(messageId);
      setMessages(prev => prev.map(m => m._id === messageId ? res.data.message : m));
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const cancelActions = () => {
    setReplyingTo(null);
    setEditingMsg(null);
    setInputText('');
  };

  // Fix: compare as strings to handle ObjectId vs string
  const isOwn = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    return String(senderId) === String(user._id);
  };

  const filtered = conversations.filter(c =>
    c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Styles ──
  const bg       = isDark ? 'bg-[#0a0d14]'   : 'bg-white';
  const border   = isDark ? 'border-white/5'  : 'border-gray-200';
  const textMain = isDark ? 'text-white'      : 'text-gray-900';
  const textSub  = isDark ? 'text-slate-400'  : 'text-gray-500';
  const inputCls = isDark
    ? 'bg-[#05070a] border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50'
    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500';
  const hoverRow = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50';

  return (
    <div className="h-[calc(100vh-140px)] flex gap-5">

      {/* ── Sidebar ── */}
      <div className={`w-80 flex-shrink-0 ${bg} border ${border} rounded-2xl flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className={`p-4 border-b ${border}`}>
          <h2 className={`text-base font-black uppercase tracking-tight ${textMain} mb-3 flex items-center gap-2`}>
            <FaInbox className="text-green-500" size={16} /> Inbox
            {conversations.reduce((s, c) => s + (c.unreadCount || 0), 0) > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                {conversations.reduce((s, c) => s + (c.unreadCount || 0), 0)} new
              </span>
            )}
          </h2>
          <div className="relative">
            <FaSearch size={12} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSub}`} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl py-2 pl-9 pr-3 text-xs outline-none transition-all ${inputCls}`}
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filtered.length > 0 ? filtered.map(conv => (
            <button
              key={conv._id}
              onClick={() => setActiveContact(conv)}
              className={`w-full p-4 flex items-center gap-3 border-b ${border} transition-all ${hoverRow} relative ${activeContact?._id === conv._id ? (isDark ? 'bg-blue-500/10' : 'bg-green-50') : ''}`}
            >
              {/* Active indicator */}
              {activeContact?._id === conv._id && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500" />
              )}

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'} flex items-center justify-center overflow-hidden border ${border}`}>
                  {conv.profilePicture || conv.avatar
                    ? <img src={conv.profilePicture || conv.avatar} className="w-full h-full object-cover" alt="" />
                    : <FaUserCircle size={20} className={textSub} />
                  }
                </div>
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                    {conv.unreadCount}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className={`font-bold text-sm truncate ${textMain}`}>{conv.fullName}</p>
                  <p className={`text-[9px] ${textSub} flex-shrink-0 ml-1`}>
                    {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
                <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-green-600 font-bold' : textSub}`}>
                  {conv.lastMessage
                    ? (String(conv.lastMessage.sender?._id || conv.lastMessage.sender) === String(user._id) ? 'You: ' : '') + conv.lastMessage.text
                    : 'No messages yet'}
                </p>
              </div>
            </button>
          )) : (
            <div className={`p-10 text-center ${textSub} opacity-40`}>
              <FaCommentDots size={32} className="mx-auto mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest">No conversations</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div className={`flex-1 ${bg} border ${border} rounded-2xl flex flex-col overflow-hidden`}>
        {activeContact ? (
          <>
            {/* Chat header */}
            <div className={`px-5 py-4 border-b ${border} flex items-center gap-3 flex-shrink-0`}>
              <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'} flex items-center justify-center overflow-hidden border ${border}`}>
                {activeContact.profilePicture || activeContact.avatar
                  ? <img src={activeContact.profilePicture || activeContact.avatar} className="w-full h-full object-cover" alt="" />
                  : <FaUserCircle size={20} className={textSub} />
                }
              </div>
              <div>
                <h3 className={`font-black text-sm ${textMain}`}>{activeContact.fullName}</h3>
                <p className={`text-[10px] ${textSub}`}>{activeContact.email}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className={`text-[10px] font-semibold ${textSub}`}>Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar ${isDark ? 'bg-[#05070a]' : 'bg-gray-50'}`}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                  <FaWhatsapp size={48} className="text-green-500 mb-3" />
                  <p className={`text-sm font-bold ${textSub}`}>No messages yet</p>
                </div>
              ) : messages.map((msg, idx) => {
                const own = isOwn(msg);
                return (
                  <div key={msg._id || idx} className={`flex ${own ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`relative max-w-[70%] px-3 py-2 rounded-2xl shadow-sm ${
                      own
                        ? 'bg-green-500 text-white rounded-br-sm'
                        : isDark
                          ? 'bg-white/10 text-white border border-white/10 rounded-bl-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                    }`}>
                      {/* Reply preview */}
                      {msg.replyTo && (
                        <div className={`mb-1.5 px-2 py-1 rounded-lg border-l-2 text-xs ${
                          own ? 'bg-black/10 border-white/40 text-white/80' : 'bg-gray-50 border-green-400 text-gray-500'
                        }`}>
                          <p className="truncate italic">{msg.replyTo.text}</p>
                        </div>
                      )}

                      {/* Product */}
                      {msg.product?.name && (
                        <div className={`mb-2 p-2 rounded-xl flex items-center gap-2 border ${
                          own ? 'bg-black/10 border-white/20' : isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                        }`}>
                          {msg.product.image && <img src={msg.product.image} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />}
                          <div className="min-w-0">
                            <p className={`text-[9px] font-black uppercase tracking-widest ${own ? 'text-white/60' : 'text-green-600'}`}>Product</p>
                            <p className="text-[11px] font-bold truncate">{msg.product.name}</p>
                          </div>
                        </div>
                      )}

                      {/* Text */}
                      <p className={`text-sm leading-relaxed ${msg.isDeleted ? 'italic opacity-50' : ''}`}>
                        {msg.text}
                        {msg.isEdited && !msg.isDeleted && <span className="text-[9px] ml-1 opacity-50">(edited)</span>}
                      </p>

                      {/* Time + read */}
                      <div className={`flex items-center gap-1 mt-1 ${own ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[9px] ${own ? 'text-white/60' : textSub}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {own && !msg.isDeleted && (
                          msg.isRead
                            ? <FaCheckDouble size={10} className="text-blue-400" />
                            : <FaCheck size={10} className="text-white/60" />
                        )}
                      </div>

                      {/* Hover actions */}
                      {!msg.isDeleted && (
                        <div className={`absolute -top-7 ${own ? 'right-0' : 'left-0'} hidden group-hover:flex items-center gap-1 ${isDark ? 'bg-[#0a0d14] border-white/10' : 'bg-white border-gray-200'} border rounded-full px-2 py-1 shadow-lg z-10`}>
                          <button onClick={() => setReplyingTo(msg)} className={`p-1 ${textSub} hover:text-green-500 transition-colors`} title="Reply">
                            <FaReply size={10} />
                          </button>
                          {own && (
                            <>
                              <button onClick={() => { setEditingMsg(msg); setInputText(msg.text); }} className={`p-1 ${textSub} hover:text-blue-500 transition-colors`} title="Edit">
                                <FaEdit size={10} />
                              </button>
                              <button onClick={() => handleDelete(msg._id)} className={`p-1 ${textSub} hover:text-red-500 transition-colors`} title="Delete">
                                <FaTrash size={10} />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply / Edit indicator */}
            {(replyingTo || editingMsg) && (
              <div className={`px-4 py-2 border-t ${border} ${isDark ? 'bg-white/5' : 'bg-green-50'} flex items-center justify-between flex-shrink-0`}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-green-500 flex-shrink-0">
                    {replyingTo ? <FaReply size={12} /> : <FaEdit size={12} />}
                  </div>
                  <p className={`text-xs truncate ${textSub}`}>
                    {replyingTo ? replyingTo.text : editingMsg?.text}
                  </p>
                </div>
                <button onClick={cancelActions} className={`${textSub} hover:text-red-500 transition-colors flex-shrink-0 ml-2`}>
                  <FaTimes size={12} />
                </button>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className={`flex items-center gap-3 p-4 border-t ${border} ${isDark ? 'bg-[#0a0d14]' : 'bg-white'} flex-shrink-0`}>
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={`Message ${activeContact.fullName}...`}
                className={`flex-1 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${inputCls}`}
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-11 h-11 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
              >
                <FaPaperPlane size={15} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
            <FaWhatsapp size={64} className="text-green-500 mb-4" />
            <h3 className={`text-lg font-black uppercase tracking-widest ${textMain}`}>Select a customer</h3>
            <p className={`text-sm font-bold uppercase tracking-widest mt-1 ${textSub}`}>to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatManagement;
