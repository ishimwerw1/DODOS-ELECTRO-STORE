import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaCommentDots, FaUserCircle, FaPaperPlane, 
  FaBox, FaClock, FaCheckDouble, FaInbox, FaCheck, FaWhatsapp,
  FaReply, FaEdit, FaTrash
} from 'react-icons/fa';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ChatManagement = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact._id);
      const interval = setInterval(() => fetchMessages(activeContact._id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await chatAPI.getConversations();
      setConversations(res.data.conversations);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const res = await chatAPI.getConversation(contactId);
      setMessages(res.data.messages);
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
        setMessages(prev => prev.map(msg => msg._id === editingMsg._id ? res.data.message : msg));
        setEditingMsg(null);
        setInputText('');
      } else {
        const payload = {
          receiverId: activeContact._id,
          text: inputText,
          replyTo: replyingTo?._id
        };
        const res = await chatAPI.sendMessage(payload);
        setMessages(prev => [...prev, res.data.message]);
        setInputText('');
        setReplyingTo(null);
        fetchConversations(); // Update last message in sidebar
      }
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleDelete = async (messageId) => {
    try {
      const res = await chatAPI.deleteMessage(messageId);
      setMessages(prev => prev.map(msg => msg._id === messageId ? res.data.message : msg));
      toast.success('Message deleted');
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const startEdit = (msg) => {
    setEditingMsg(msg);
    setInputText(msg.text);
    setReplyingTo(null);
  };

  const cancelActions = () => {
    setReplyingTo(null);
    setEditingMsg(null);
    setInputText('');
  };

  const filteredConversations = conversations.filter(conv => 
    conv.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* Sidebar - Conversation List */}
      <div className="w-96 bg-bg-card border border-border-main rounded-[2.5rem] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border-main">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-4 flex items-center gap-3">
            <FaInbox className="text-blue-500" /> Inbox
          </h2>
          <div className="relative group">
            <FaSearch size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-surface border border-border-main rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => setActiveContact(conv)}
                className={`w-full p-5 flex items-center gap-4 border-b border-border-main/50 transition-all hover:bg-blue-500/5 relative ${activeContact?._id === conv._id ? 'bg-blue-500/10' : ''}`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-bg-surface flex items-center justify-center border border-border-main overflow-hidden">
                    {conv.profilePicture || conv.avatar ? (
                      <img src={conv.profilePicture || conv.avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <FaUserCircle size={24} className="text-slate-500" />
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-bg-card">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-white text-sm truncate">{conv.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">
                      {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                  <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-blue-400 font-bold' : 'text-slate-400 font-medium'}`}>
                    {conv.lastMessage ? (conv.lastMessage.sender === user._id ? 'You: ' : '') + conv.lastMessage.text : 'No messages yet'}
                  </p>
                </div>
                {activeContact?._id === conv._id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}
              </button>
            ))
          ) : (
            <div className="p-10 text-center opacity-30">
              <FaCommentDots size={40} className="mx-auto mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-bg-card border border-border-main rounded-[2.5rem] flex flex-col overflow-hidden">
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-border-main bg-bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-bg-card border border-border-main flex items-center justify-center overflow-hidden">
                  {activeContact.profilePicture || activeContact.avatar ? (
                    <img src={activeContact.profilePicture || activeContact.avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <FaUserCircle size={24} className="text-slate-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-tighter">{activeContact.fullName}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{activeContact.email}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
              style={{ 
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(13, 110, 253, 0.05) 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}
            >
              {messages.map((msg, idx) => {
                const isOwn = msg.sender === user._id;
                return (
                  <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group/msg`}>
                    <div className={`relative max-w-[70%] ${isOwn ? 'text-right' : 'text-left'}`}>
                      {/* Reply Preview */}
                      {msg.replyTo && (
                        <div className={`mb-2 p-2 rounded-lg border-l-4 text-xs text-left ${
                          isOwn ? 'bg-black/10 border-white/30 ml-auto' : 'bg-bg-surface border-blue-500'
                        }`}>
                          <p className="font-black uppercase tracking-widest opacity-60">Replying to:</p>
                          <p className="truncate italic opacity-80">{msg.replyTo.text}</p>
                        </div>
                      )}

                      {msg.product && (
                        <div className={`mb-2 p-3 rounded-2xl flex items-center gap-4 max-w-sm ${
                          isOwn ? 'bg-black/10 border border-white/10 ml-auto' : 'bg-bg-surface border border-border-main'
                        }`}>
                          <img src={msg.product.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                          <div className="text-left min-w-0">
                            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isOwn ? 'text-white/60' : 'text-blue-500'}`}>Product Inquiry</p>
                            <p className={`text-xs font-bold truncate ${isOwn ? 'text-white' : 'text-text-main'}`}>{msg.product.name}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className={`relative inline-block px-5 py-3 rounded-2xl shadow-sm ${
                        isOwn 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-bg-surface border border-border-main text-text-main rounded-tl-none'
                      }`}>
                        {/* Message Tail */}
                        <div 
                          className={`absolute top-0 w-3 h-3 ${
                            isOwn 
                              ? '-right-1.5 bg-blue-600 clip-path-polygon-[0%_0%,100%_0%,0%_100%]' 
                              : '-left-1.5 bg-bg-surface border-t border-l border-border-main clip-path-polygon-[0%_0%,100%_0%,100%_100%]'
                          }`} 
                        />

                        <p className={`text-sm font-medium leading-relaxed mb-1 pr-16 text-left ${msg.isDeleted ? 'italic opacity-60' : ''}`}>
                          {msg.text}
                          {msg.isEdited && !msg.isDeleted && (
                            <span className="text-[9px] ml-2 opacity-50">(edited)</span>
                          )}
                        </p>
                        
                        <div className={`flex items-center gap-1 absolute bottom-1.5 right-3 ${isOwn ? 'text-white/60' : 'text-text-secondary'}`}>
                          <span className="text-[9px] font-bold uppercase tracking-tight">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && !msg.isDeleted && (
                            msg.isRead ? <FaCheckDouble size={10} className="text-blue-300" /> : <FaCheck size={10} />
                          )}
                        </div>

                        {/* Message Actions */}
                        {!msg.isDeleted && (
                          <div className={`absolute -top-8 ${isOwn ? 'right-0' : 'left-0'} flex items-center gap-1 bg-bg-surface border border-border-main rounded-full px-2 py-1 shadow-lg opacity-0 group-hover/msg:opacity-100 transition-opacity z-10`}>
                            <button onClick={() => setReplyingTo(msg)} className="p-1.5 hover:text-blue-500 transition-colors" title="Reply">
                              <FaReply size={10} />
                            </button>
                            {isOwn && (
                              <>
                                <button onClick={() => startEdit(msg)} className="p-1.5 hover:text-blue-500 transition-colors" title="Edit">
                                  <FaEdit size={10} />
                                </button>
                                <button onClick={() => handleDelete(msg._id)} className="p-1.5 hover:text-red-500 transition-colors" title="Delete">
                                  <FaTrash size={10} />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply/Edit Indicator */}
            {(replyingTo || editingMsg) && (
              <div className="px-6 py-2 bg-bg-surface border-t border-border-main flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-blue-500">
                    {replyingTo ? <FaReply size={14} /> : <FaEdit size={14} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                      {replyingTo ? 'Replying to message' : 'Editing message'}
                    </p>
                    <p className="text-[11px] font-bold text-white truncate w-96">
                      {replyingTo ? replyingTo.text : editingMsg.text}
                    </p>
                  </div>
                </div>
                <button onClick={cancelActions} className="text-slate-500 hover:text-red-500 p-2">
                  <FaTimes size={14} />
                </button>
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-6 border-t border-border-main bg-bg-surface/50 flex gap-4 items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activeContact.fullName}...`}
                className="flex-1 bg-bg-card border border-border-main rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <FaPaperPlane size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
            <FaWhatsapp size={80} className="text-blue-500 mb-6" />
            <h3 className="text-xl font-black uppercase tracking-widest">Select a customer</h3>
            <p className="text-sm font-bold uppercase tracking-widest mt-2">to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatManagement;
