import express from 'express';
import { 
  sendMessage, 
  getConversation, 
  getConversations, 
  getAdminId,
  getUnreadCount,
  editMessage,
  deleteMessage,
  sendGuestMessage,
  getGuestConversation,
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public (guest) routes — no auth required
router.post('/guest', sendGuestMessage);
router.get('/guest/:guestId', getGuestConversation);

// Protected routes — auth required
router.get('/admin', protect, getAdminId);
router.get('/unread/count', protect, getUnreadCount);
router.get('/conversations', protect, getConversations);
router.get('/:otherUserId', protect, getConversation);
router.post('/', protect, sendMessage);
router.put('/:messageId', protect, editMessage);
router.delete('/:messageId', protect, deleteMessage);

export default router;
