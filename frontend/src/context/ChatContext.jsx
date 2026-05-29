import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const [isOpen, setIsOpen]           = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [adminId, setAdminId]         = useState(null);
  const [messages, setMessages]       = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Keep a ref to isOpen so callbacks always see the latest value
  const isOpenRef = useRef(isOpen);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  // Keep a ref to the openChat function to avoid stale closures
  const openChatRef = useRef(null);

  // Fetch admin ID when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      chatAPI.getAdminId()
        .then(res => setAdminId(res.data.adminId))
        .catch(() => {});
    } else {
      setAdminId(null);
      setMessages([]);
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  const fetchMessages = useCallback(async () => {
    if (!isLoggedIn || !adminId) return;
    try {
      const res = await chatAPI.getConversation(adminId);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Chat fetch error:', err.response?.data?.message || err.message);
    }
  }, [isLoggedIn, adminId]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await chatAPI.getUnreadCount();
      const newCount = res.data.count ?? 0;
      setUnreadCount(prev => {
        if (newCount > prev && !isOpenRef.current) {
          toast.info('💬 New message from support!', {
            toastId: 'new-chat-msg',
            autoClose: 4000,
            onClick: () => openChatRef.current?.(),
          });
        }
        return newCount;
      });
    } catch { /* silent */ }
  }, [isLoggedIn]);

  // Poll unread count every 10s
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(id);
  }, [isLoggedIn, fetchUnreadCount]);

  // Poll messages every 5s when chat is open
  useEffect(() => {
    if (!isOpen || !adminId) return;
    fetchMessages();
    const id = setInterval(fetchMessages, 5000);
    return () => clearInterval(id);
  }, [isOpen, adminId, fetchMessages]);

  const openChat = useCallback((product = null) => {
    setActiveProduct(product);
    setIsOpen(true);
  }, []);

  // Keep ref in sync
  useEffect(() => { openChatRef.current = openChat; }, [openChat]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setActiveProduct(null);
  }, []);

  const sendMessage = useCallback(async (text, replyToId = null) => {
    if (!adminId || !text.trim()) return false;
    try {
      const payload = {
        receiverId: adminId,
        text: text.trim(),
        product: activeProduct
          ? { name: activeProduct.name, image: activeProduct.image, id: activeProduct._id }
          : null,
        replyTo: replyToId || null,
      };
      const res = await chatAPI.sendMessage(payload);
      setMessages(prev => [...prev, res.data.message]);
      setActiveProduct(null);
      return true;
    } catch (err) {
      console.error('Send message error:', err.response?.data?.message || err.message);
      toast.error('Failed to send message. Please try again.');
      return false;
    }
  }, [adminId, activeProduct]);

  const editMessage = useCallback(async (messageId, text) => {
    try {
      const res = await chatAPI.editMessage(messageId, text);
      setMessages(prev => prev.map(m => m._id === messageId ? res.data.message : m));
      return true;
    } catch { return false; }
  }, []);

  const deleteMessage = useCallback(async (messageId) => {
    try {
      const res = await chatAPI.deleteMessage(messageId);
      setMessages(prev => prev.map(m => m._id === messageId ? res.data.message : m));
      return true;
    } catch { return false; }
  }, []);

  return (
    <ChatContext.Provider value={{
      isOpen, openChat, closeChat,
      activeProduct, setActiveProduct,
      messages, sendMessage, editMessage, deleteMessage,
      adminId, unreadCount,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
