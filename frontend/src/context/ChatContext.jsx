import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const ChatContext = createContext();

const generateGuestId = () => {
  let id = localStorage.getItem('dodos_guest_id');
  if (!id) {
    id = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('dodos_guest_id', id);
  }
  return id;
};

export const ChatProvider = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const [isOpen, setIsOpen]           = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [adminId, setAdminId]         = useState(null);
  const [messages, setMessages]       = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const guestId                       = generateGuestId();

  const isOpenRef = useRef(isOpen);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  const openChatRef = useRef(null);

  // Fetch admin ID always (needed for both guest and logged-in)
  useEffect(() => {
    chatAPI.getAdminId()
      .then(res => setAdminId(res.data.adminId))
      .catch(() => {});
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      if (isLoggedIn && adminId) {
        const res = await chatAPI.getConversation(adminId);
        setMessages(res.data.messages || []);
      } else {
        const res = await chatAPI.getGuestConversation(guestId);
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Chat fetch error:', err.response?.data?.message || err.message);
    }
  }, [isLoggedIn, adminId, guestId]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await chatAPI.getUnreadCount();
      const newCount = res.data.count ?? 0;
      setUnreadCount(prev => {
        if (newCount > prev && !isOpenRef.current) {
          toast.info('New message from support!', {
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
    if (!isOpen) return;
    fetchMessages();
    const id = setInterval(fetchMessages, 5000);
    return () => clearInterval(id);
  }, [isOpen, fetchMessages]);

  const openChat = useCallback((product = null) => {
    setActiveProduct(product);
    setIsOpen(true);
  }, []);

  useEffect(() => { openChatRef.current = openChat; }, [openChat]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setActiveProduct(null);
  }, []);

  const sendMessage = useCallback(async (text, replyToId = null) => {
    if (!text.trim()) return false;
    try {
      const productPayload = activeProduct
        ? { name: activeProduct.name, image: activeProduct.image, _id: activeProduct._id }
        : null;

      if (isLoggedIn && adminId) {
        const payload = {
          receiverId: adminId,
          text: text.trim(),
          product: productPayload,
          replyTo: replyToId || null,
        };
        const res = await chatAPI.sendMessage(payload);
        setMessages(prev => [...prev, res.data.message]);
      } else {
        const payload = {
          guestId,
          text: text.trim(),
          product: productPayload,
        };
        const res = await chatAPI.sendGuestMessage(payload);
        setMessages(prev => [...prev, res.data.message]);
      }
      setActiveProduct(null);
      return true;
    } catch (err) {
      console.error('Send message error:', err.response?.data?.message || err.message);
      toast.error('Failed to send message. Please try again.');
      return false;
    }
  }, [isLoggedIn, adminId, activeProduct, guestId]);

  const editMessage = useCallback(async (messageId, text) => {
    if (!isLoggedIn) return false;
    try {
      const res = await chatAPI.editMessage(messageId, text);
      setMessages(prev => prev.map(m => m._id === messageId ? res.data.message : m));
      return true;
    } catch { return false; }
  }, [isLoggedIn]);

  const deleteMessage = useCallback(async (messageId) => {
    if (!isLoggedIn) return false;
    try {
      const res = await chatAPI.deleteMessage(messageId);
      setMessages(prev => prev.map(m => m._id === messageId ? res.data.message : m));
      return true;
    } catch { return false; }
  }, [isLoggedIn]);

  return (
    <ChatContext.Provider value={{
      isOpen, openChat, closeChat,
      activeProduct, setActiveProduct,
      messages, sendMessage, editMessage, deleteMessage,
      adminId, unreadCount, isLoggedIn,
      guestId,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
