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
import { protect, verifiedOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', protect, getAdminId);
router.get('/unread/count', protect, verifiedOnly, getUnreadCount);
router.get('/conversations', protect, verifiedOnly, getConversations);
router.get('/:otherUserId', protect, verifiedOnly, getConversation);
router.post('/', protect, verifiedOnly, sendMessage);
router.put('/:messageId', protect, verifiedOnly, editMessage);
router.delete('/:messageId', protect, verifiedOnly, deleteMessage);

export default router;
