import express from 'express';
const router = express.Router();
import { bookRepair, getRepairs } from '../controllers/repairController.js';
import { protect, adminOnly } from '../middleware/auth.js';

router.post('/', bookRepair); // Can be public
router.get('/', protect, adminOnly, getRepairs); // Admin only

export default router;
