import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch Admin ID on mount if logged in
  useEffect(() => {
    if (isLoggedIn && user?.role === 'user') {
      chatAPI.getAdminId()
        .then(res => setAdminId(res.data.adminId))
        .catch(err => console.error('Failed to get admin ID:', err));
    }
  }, [isLoggedIn, user]);

  const fetchMessages = useCallback(async () => {
    if (!isLoggedIn || !adminId) return;
    try {
      const res = await chatAPI.getConversation(adminId);
      setMessages(res.data.messages);
      // After fetching messages (which marks them as read on backend), update unread count
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  }, [isLoggedIn, adminId]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await chatAPI.getUnreadCount();
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [isLoggedIn]);

  // Polling for new messages and unread count
  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s instead of 10s
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, fetchUnreadCount]);

  useEffect(() => {
    if (isOpen && adminId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 10000); // Poll every 10s instead of 5s
      return () => clearInterval(interval);
    }
  }, [isOpen, adminId, fetchMessages]);

  const openChat = (product = null) => {
    setActiveProduct(product);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setActiveProduct(null);
  };

  const sendMessage = async (text, replyToId = null) => {
    if (!adminId) return;
    try {
      const payload = {
        receiverId: adminId,
        text,
        product: activeProduct ? {
          name: activeProduct.name,
          image: activeProduct.image,
          id: activeProduct._id
        } : null,
        replyTo: replyToId
      };
      const res = await chatAPI.sendMessage(payload);
      setMessages(prev => [...prev, res.data.message]);
      setActiveProduct(null); // Clear product after first message in chat
      return true;
    } catch (err) {
      console.error('Failed to send message:', err);
      return false;
    }
  };

  const editMessage = async (messageId, text) => {
    try {
      const res = await chatAPI.editMessage(messageId, text);
      setMessages(prev => prev.map(msg => msg._id === messageId ? res.data.message : msg));
      return true;
    } catch (err) {
      console.error('Failed to edit message:', err);
      return false;
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const res = await chatAPI.deleteMessage(messageId);
      setMessages(prev => prev.map(msg => msg._id === messageId ? res.data.message : msg));
      return true;
    } catch (err) {
      console.error('Failed to delete message:', err);
      return false;
    }
  };

  return (
    <ChatContext.Provider value={{
      isOpen,
      openChat,
      closeChat,
      activeProduct,
      setActiveProduct,
      messages,
      sendMessage,
      editMessage,
      deleteMessage,
      adminId,
      unreadCount
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
