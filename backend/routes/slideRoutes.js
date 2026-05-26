import express from 'express';
import { getSlides, getAllSlides, createSlide, updateSlide, deleteSlide } from '../controllers/slideController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getSlides)
  .post(protect, adminOnly, createSlide);

router.get('/admin', protect, adminOnly, getAllSlides);

router.route('/:id')
  .put(protect, adminOnly, updateSlide)
  .delete(protect, adminOnly, deleteSlide);

export default router;