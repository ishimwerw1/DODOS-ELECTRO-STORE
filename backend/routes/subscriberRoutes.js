import express from 'express';
const router = express.Router();
import { subscribe, getSubscribers } from '../controllers/subscriberController.js';
import { protect, adminOnly } from '../middleware/auth.js';

router.post('/', subscribe);
router.get('/', protect, adminOnly, getSubscribers);

export default router;
