import express from 'express';
import { 
  sendMessage, 
  getConversation, 
  getConversations, 
  getAdminId,
  getUnreadCount,
  editMessage,
  deleteMessage
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', protect, getAdminId);
router.get('/unread/count', protect, getUnreadCount);
router.get('/conversations', protect, getConversations);
router.get('/:otherUserId', protect, getConversation);
router.post('/', protect, sendMessage);
router.put('/:messageId', protect, editMessage);
router.delete('/:messageId', protect, deleteMessage);

export default router;
