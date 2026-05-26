import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FaTimes, FaPaperPlane, FaCommentDots, FaBox, FaUserCircle, 
  FaCheck, FaCheckDouble, FaWhatsapp, FaReply, FaEdit, FaTrash,
  FaAndroid, FaApple, FaDesktop, FaDownload, FaCheckCircle
} from 'react-icons/fa';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const ChatWindow = () => {
  const { 
    isOpen, openChat, closeChat, activeProduct, setActiveProduct, 
    messages, sendMessage, editMessage, deleteMessage, 
    adminId, unreadCount 
  } = useChat();
  const { isLoggedIn, user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [showFloatingActions, setShowFloatingActions] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    // If already in standalone mode, don't show modal
    if (window.matchMedia('(display-mode: standalone)').matches) {
      toast.info('DODOS App is already installed and running! 🚀');
      return;
    }

    if (isIOS) {
      setShowInstallModal(true);
      return;
    }

    if (!deferredPrompt) {
      toast.info('Installation is not supported on this browser. Try Chrome or Edge! 🌐');
      return;
    }
    setShowInstallModal(true);
  };

  const triggerBrowserInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallModal(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (editingMsg) {
      const success = await editMessage(editingMsg._id, inputText);
      if (success) {
        setInputText('');
        setEditingMsg(null);
      }
    } else {
      const success = await sendMessage(inputText, replyingTo?._id);
      if (success) {
        setInputText('');
        setReplyingTo(null);
      }
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

  if (!isLoggedIn || user?.role === 'admin') return (
    <FloatingActionBar show={showFloatingActions && !isOpen} onInstall={handleInstallClick} />
  );

  return (
    <>
      <FloatingActionBar show={showFloatingActions && !isOpen} onInstall={handleInstallClick} />

      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0a0d14] border border-white/5 rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
              
              <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-blue-500 border border-blue-500/20">
                <FaDownload size={40} className="animate-bounce" />
              </div>

              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Install DODOS App</h2>
              <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed">
                Experience the premium store with faster loading, offline access, and instant notifications.
              </p>

              <div className="grid grid-cols-1 gap-4">
                {isIOS ? (
                  <div className="space-y-6">
                    <div className="bg-white/5 p-6 rounded-2xl text-left border border-white/5">
                      <p className="text-white text-xs font-black uppercase tracking-widest mb-4">Instructions for iOS:</p>
                      <ol className="space-y-3 text-slate-400 text-xs font-medium">
                        <li className="flex gap-3">
                          <span className="w-5 h-5 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                          <span>Tap the <span className="text-white font-bold">"Share"</span> button at the bottom of Safari.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-5 h-5 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                          <span>Scroll down and tap <span className="text-white font-bold">"Add to Home Screen"</span>.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-5 h-5 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                          <span>Tap <span className="text-white font-bold">"Add"</span> in the top right corner.</span>
                        </li>
                      </ol>
                    </div>
                    <button
                      onClick={() => setShowInstallModal(false)}
                      className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                      Got it!
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={triggerBrowserInstall}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95"
                    >
                      <FaCheckCircle /> Install Now
                    </button>
                    <button
                      onClick={() => setShowInstallModal(false)}
                      className="w-full py-5 text-slate-500 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                      Not Now
                    </button>
                  </>
                )}
              </div>

              <div className="mt-10 flex items-center justify-center gap-6 opacity-30">
                <FaAndroid size={20} />
                <FaApple size={20} />
                <FaDesktop size={20} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <button
        onClick={() => isOpen ? closeChat() : openChat()}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[110] hover:scale-110 transition-transform active:scale-95 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <FaTimes size={24} className="relative z-10" /> : <FaWhatsapp size={32} className="relative z-10" />}
        
        {unreadCount > 0 && !isOpen && (
          <span className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9, originX: '100%', originY: '100%' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-[380px] h-[600px] bg-bg-card border border-border-main rounded-[2rem] shadow-2xl z-[100] flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* WhatsApp Header */}
            <div className="p-4 bg-blue-600 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white border-2 border-white/20">
                    <FaUserCircle size={28} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full" />
                </div>
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-widest">Support Team</p>
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Always Online</p>
                </div>
              </div>
              <button onClick={closeChat} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                <FaTimes size={18} />
              </button>
            </div>

            {/* Chat Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
              style={{ 
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(13, 110, 253, 0.05) 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                  <FaWhatsapp size={60} className="text-blue-500 mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">End-to-end encrypted</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.sender === user._id;
                  return (
                    <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group/msg`}>
                      <div 
                        className={`relative max-w-[85%] px-4 py-2 rounded-2xl shadow-sm ${
                          isOwn 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-bg-surface text-text-main border border-border-main rounded-tl-none'
                        }`}
                      >
                        {/* Message Tail */}
                        <div 
                          className={`absolute top-0 w-3 h-3 ${
                            isOwn 
                              ? '-right-1.5 bg-blue-600 clip-path-polygon-[0%_0%,100%_0%,0%_100%]' 
                              : '-left-1.5 bg-bg-surface border-t border-l border-border-main clip-path-polygon-[0%_0%,100%_0%,100%_100%]'
                          }`} 
                        />

                        {/* Reply Preview */}
                        {msg.replyTo && (
                          <div className={`mb-2 p-2 rounded-lg border-l-4 text-xs ${
                            isOwn ? 'bg-black/10 border-white/30' : 'bg-bg-card border-blue-500'
                          }`}>
                            <p className="font-black uppercase tracking-widest opacity-60">Replying to:</p>
                            <p className="truncate italic opacity-80">{msg.replyTo.text}</p>
                          </div>
                        )}

                        {msg.product && (
                          <div className={`mb-2 p-2 rounded-xl flex items-center gap-3 border ${
                            isOwn ? 'bg-black/10 border-white/10' : 'bg-bg-card border-border-main'
                          }`}>
                            <img src={msg.product.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                            <div className="min-w-0">
                              <p className={`text-[9px] font-black uppercase tracking-widest ${isOwn ? 'text-white/60' : 'text-blue-500'}`}>Product Inquiry</p>
                              <p className="text-[11px] font-bold truncate">{msg.product.name}</p>
                            </div>
                          </div>
                        )}
                        
                        <p className={`text-sm font-medium leading-relaxed mb-1 pr-12 ${msg.isDeleted ? 'italic opacity-60' : ''}`}>
                          {msg.text}
                          {msg.isEdited && !msg.isDeleted && (
                            <span className="text-[9px] ml-2 opacity-50">(edited)</span>
                          )}
                        </p>
                        
                        <div className={`flex items-center gap-1 absolute bottom-1 right-2 ${isOwn ? 'text-white/60' : 'text-text-secondary'}`}>
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
                                <button onClick={() => deleteMessage(msg._id)} className="p-1.5 hover:text-red-500 transition-colors" title="Delete">
                                  <FaTrash size={10} />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply/Edit Indicator */}
            {(replyingTo || editingMsg || activeProduct) && (
              <div className="px-4 py-2 bg-bg-surface border-t border-border-main animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-500">
                      {replyingTo ? <FaReply size={14} /> : editingMsg ? <FaEdit size={14} /> : <FaBox size={14} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                        {replyingTo ? 'Replying to message' : editingMsg ? 'Editing message' : 'Attaching Product'}
                      </p>
                      <p className="text-[11px] font-bold text-text-main truncate w-60">
                        {replyingTo ? replyingTo.text : editingMsg ? editingMsg.text : activeProduct?.name}
                      </p>
                    </div>
                  </div>
                  <button onClick={cancelActions} className="text-text-secondary hover:text-red-500 p-2 transition-colors">
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-border-main bg-bg-surface flex gap-3 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-bg-card border border-border-main rounded-2xl px-5 py-3 text-sm text-text-main outline-none focus:border-blue-500/50 transition-all placeholder:text-text-secondary/40"
                />
              </div>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-blue-500/20 active:scale-90"
              >
                <FaPaperPlane size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const FloatingActionBar = ({ show, onInstall }) => {
  if (!show) return null;

  const actions = [
    { icon: <FaWhatsapp size={20} />, color: 'bg-[#25D366]', label: 'WhatsApp', link: 'https://wa.me/250783211453' },
    { icon: <FaAndroid size={20} />, color: 'bg-[#3DDC84]', label: 'Android App', link: '#', onClick: onInstall },
    { icon: <FaApple size={20} />, color: 'bg-[#A2AAAD]', label: 'iOS App', link: '#', onClick: onInstall },
    { icon: <FaDesktop size={20} />, color: 'bg-[#0078D4]', label: 'Desktop App', link: '#', onClick: onInstall }
  ];

  return (
    <div className="fixed right-6 bottom-24 flex flex-col gap-4 z-[110]">
      {actions.map((action, idx) => (
        <motion.a
          key={idx}
          href={action.link}
          onClick={(e) => {
            if (action.onClick) {
              e.preventDefault();
              action.onClick();
            }
          }}
          target={action.link !== '#' ? "_blank" : undefined}
          rel={action.link !== '#' ? "noopener noreferrer" : undefined}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: idx * 0.1 }}
          className={`w-12 h-12 ${action.color} text-white rounded-2xl shadow-xl flex items-center justify-center group relative hover:scale-110 transition-transform active:scale-95 cursor-pointer`}
        >
          {action.icon}
          <span className="absolute right-16 bg-bg-card border border-border-main px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl text-text-main">
            {action.label}
          </span>
        </motion.a>
      ))}
    </div>
  );
};

export default ChatWindow;
