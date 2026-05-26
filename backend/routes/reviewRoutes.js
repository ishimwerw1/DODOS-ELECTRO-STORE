import express from 'express';
import { getReviews, createReview, deleteReview } from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/',    getReviews);
router.get('/admin', protect, adminOnly, getReviews); // Same controller for now, but could be different later
router.post('/',   createReview);
router.delete('/:id', protect, adminOnly, deleteReview);

export default router;
