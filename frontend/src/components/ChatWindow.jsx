import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaTimes, FaPaperPlane, FaComments, FaUserCircle,
  FaCheck, FaCheckDouble, FaReply, FaEdit, FaTrash,
  FaCheckCircle, FaBox, FaWhatsapp
} from 'react-icons/fa';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const ChatWindow = () => {
  const {
    isOpen, openChat, closeChat, activeProduct, setActiveProduct,
    messages, sendMessage, editMessage, deleteMessage,
    adminId, unreadCount,
  } = useChat();
  const { isLoggedIn, user } = useAuth();

  const [inputText, setInputText]       = useState('');
  const [replyingTo, setReplyingTo]     = useState(null);
  const [editingMsg, setEditingMsg]     = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isIOS, setIsIOS]               = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Scroll to bottom whenever messages change or chat opens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // Detect browser for install instructions
  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (/SamsungBrowser/i.test(ua)) return 'samsung';
    if (/OPR|Opera/i.test(ua))      return 'opera';
    if (/Firefox/i.test(ua))        return 'firefox';
    if (/Edg/i.test(ua))            return 'edge';
    if (/Chrome/i.test(ua))         return 'chrome';
    if (/Safari/i.test(ua))         return 'safari';
    return 'other';
  };

  const handleInstallClick = () => {
    // Already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      toast.info('DODOS App is already installed!');
      return;
    }
    // Chrome/Edge/Samsung/Opera support beforeinstallprompt
    if (deferredPrompt) {
      triggerBrowserInstall();
      return;
    }
    // Show manual instructions for all other browsers
    setShowInstallModal(true);
  };

  const triggerBrowserInstall = async () => {
    if (!deferredPrompt) { setShowInstallModal(true); return; }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') { setDeferredPrompt(null); setShowInstallModal(false); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (editingMsg) {
      const ok = await editMessage(editingMsg._id, inputText);
      if (ok) { setInputText(''); setEditingMsg(null); }
    } else {
      const ok = await sendMessage(inputText, replyingTo?._id);
      if (ok) { setInputText(''); setReplyingTo(null); }
    }
  };

  const cancelActions = () => {
    setReplyingTo(null);
    setEditingMsg(null);
    setInputText('');
  };

  // Admins don't see the chat widget — they use ChatManagement
  if (!isLoggedIn || user?.role === 'admin') {
    return null;
  }

  // Helper: compare sender id (could be string or ObjectId)
  const isOwn = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    return String(senderId) === String(user._id);
  };

  return (
    <>
      {/* Install modal — cross-browser */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500 flex-shrink-0">
                  <FaDownload size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">Install DODOS App</h2>
                  <p className="text-xs text-gray-400">Works on all browsers & devices</p>
                </div>
              </div>

              {/* Auto-install button (Chrome/Edge/Samsung/Opera) */}
              {deferredPrompt && (
                <button
                  onClick={triggerBrowserInstall}
                  className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-sm mb-4 transition-all flex items-center justify-center gap-2 shadow-sm shadow-green-500/20"
                >
                  <FaCheckCircle size={14} /> Install Now — One Click
                </button>
              )}

              {/* Manual instructions per browser */}
              <div className="space-y-3 text-sm">
                {/* iOS Safari */}
                {isIOS && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="font-black text-gray-700 text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <FaApple size={12} /> Safari (iPhone / iPad)
                    </p>
                    <ol className="text-gray-500 text-xs space-y-1 list-decimal list-inside">
                      <li>Tap the <strong>Share</strong> button (box with arrow)</li>
                      <li>Scroll and tap <strong>Add to Home Screen</strong></li>
                      <li>Tap <strong>Add</strong> to confirm</li>
                    </ol>
                  </div>
                )}

                {/* Chrome / Edge / Brave */}
                {!isIOS && !deferredPrompt && (
                  <>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="font-black text-blue-700 text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <FaDesktop size={11} /> Chrome / Edge / Brave
                      </p>
                      <ol className="text-blue-600 text-xs space-y-1 list-decimal list-inside">
                        <li>Click the <strong>⋮</strong> menu (top-right)</li>
                        <li>Select <strong>Install app</strong> or <strong>Add to Home Screen</strong></li>
                        <li>Click <strong>Install</strong> to confirm</li>
                      </ol>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                      <p className="font-black text-orange-700 text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <FaAndroid size={11} /> Samsung Browser / Opera
                      </p>
                      <ol className="text-orange-600 text-xs space-y-1 list-decimal list-inside">
                        <li>Tap the <strong>☰</strong> menu</li>
                        <li>Tap <strong>Add page to</strong> → <strong>Home screen</strong></li>
                        <li>Tap <strong>Add</strong></li>
                      </ol>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                      <p className="font-black text-purple-700 text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <FaDesktop size={11} /> Firefox
                      </p>
                      <ol className="text-purple-600 text-xs space-y-1 list-decimal list-inside">
                        <li>Tap the <strong>⋮</strong> menu</li>
                        <li>Tap <strong>Install</strong> or <strong>Add to Home Screen</strong></li>
                      </ol>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setShowInstallModal(false)}
                className="w-full mt-5 py-3 text-gray-400 hover:text-gray-600 text-sm font-semibold transition-colors border-t border-gray-100 pt-4"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating chat button */}
      <button
        onClick={() => isOpen ? closeChat() : openChat()}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center z-[110] transition-all active:scale-95 relative"
      >
        {isOpen ? <FaTimes size={20} /> : <FaComments size={26} />}
        {unreadCount > 0 && !isOpen && (
          <>
            <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-40" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white z-10">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        )}
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 w-[360px] h-[560px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-green-500 shadow-sm flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white border-2 border-white/30">
                    <FaUserCircle size={22} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-300 border-2 border-green-500 rounded-full" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">DODOS Support</p>
                  <p className="text-green-100 text-[10px] font-semibold">Always Online</p>
                </div>
              </div>
              <button onClick={closeChat} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <FaTimes size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-3">
                    <FaWhatsapp size={28} className="text-green-400" />
                  </div>
                  <p className="text-gray-400 text-sm font-semibold">Start a conversation</p>
                  <p className="text-gray-300 text-xs mt-1">We typically reply within minutes</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const own = isOwn(msg);
                  return (
                    <div key={msg._id || idx} className={`flex ${own ? 'justify-end' : 'justify-start'} group`}>
                      <div className={`relative max-w-[80%] px-3 py-2 rounded-2xl shadow-sm ${
                        own
                          ? 'bg-green-500 text-white rounded-br-sm'
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

                        {/* Product attachment */}
                        {msg.product?.name && (
                          <div className={`mb-2 p-2 rounded-xl flex items-center gap-2 border ${
                            own ? 'bg-black/10 border-white/20' : 'bg-gray-50 border-gray-200'
                          }`}>
                            {msg.product.image && (
                              <img src={msg.product.image} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
                            )}
                            <div className="min-w-0">
                              <p className={`text-[9px] font-black uppercase tracking-widest ${own ? 'text-white/60' : 'text-green-600'}`}>Product</p>
                              <p className="text-[11px] font-bold truncate">{msg.product.name}</p>
                            </div>
                          </div>
                        )}

                        {/* Message text */}
                        <p className={`text-sm leading-relaxed ${msg.isDeleted ? 'italic opacity-50' : ''}`}>
                          {msg.text}
                          {msg.isEdited && !msg.isDeleted && (
                            <span className="text-[9px] ml-1 opacity-50">(edited)</span>
                          )}
                        </p>

                        {/* Time + read status */}
                        <div className={`flex items-center gap-1 mt-1 ${own ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-[9px] ${own ? 'text-white/60' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {own && !msg.isDeleted && (
                            msg.isRead
                              ? <FaCheckDouble size={10} className="text-white/80" />
                              : <FaCheck size={10} className="text-white/60" />
                          )}
                        </div>

                        {/* Hover actions */}
                        {!msg.isDeleted && (
                          <div className={`absolute -top-7 ${own ? 'right-0' : 'left-0'} hidden group-hover:flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-1 shadow-lg z-10`}>
                            <button onClick={() => setReplyingTo(msg)} className="p-1 text-gray-400 hover:text-green-600 transition-colors" title="Reply">
                              <FaReply size={10} />
                            </button>
                            {own && (
                              <>
                                <button onClick={() => { setEditingMsg(msg); setInputText(msg.text); }} className="p-1 text-gray-400 hover:text-blue-500 transition-colors" title="Edit">
                                  <FaEdit size={10} />
                                </button>
                                <button onClick={() => deleteMessage(msg._id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
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

            {/* Reply / Edit / Product indicator */}
            {(replyingTo || editingMsg || activeProduct) && (
              <div className="px-4 py-2 bg-green-50 border-t border-green-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-green-500 flex-shrink-0">
                    {replyingTo ? <FaReply size={12} /> : editingMsg ? <FaEdit size={12} /> : <FaBox size={12} />}
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {replyingTo ? replyingTo.text : editingMsg ? editingMsg.text : activeProduct?.name}
                  </p>
                </div>
                <button onClick={cancelActions} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2">
                  <FaTimes size={12} />
                </button>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-gray-200 bg-white flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={editingMsg ? 'Edit message...' : 'Type a message...'}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
              >
                <FaPaperPlane size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWindow;
