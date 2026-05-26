import express from 'express';
const router = express.Router();
import { 
  getCoupons, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon,
  validateCoupon
} from '../controllers/couponController.js';
import { protect, adminOnly } from '../middleware/auth.js';

router.route('/')
  .get(protect, adminOnly, getCoupons)
  .post(protect, adminOnly, createCoupon);

router.post('/validate', protect, validateCoupon);

router.route('/:id')
  .put(protect, adminOnly, updateCoupon)
  .delete(protect, adminOnly, deleteCoupon);

export default router;
