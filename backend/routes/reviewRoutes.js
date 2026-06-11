import express from 'express';
import { getReviews, getAllReviews, createReview, deleteReview } from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/',    getReviews);
router.get('/admin', protect, adminOnly, getAllReviews);
router.post('/',   createReview);
router.delete('/:id', protect, adminOnly, deleteReview);

export default router;
