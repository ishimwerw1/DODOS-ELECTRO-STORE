import express from 'express';
import { createOrder, getOrders, getOrder, getAllOrders, updateOrderStatus, deleteOrder } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getOrders);
router.get('/all', adminOnly, getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/status', adminOnly, updateOrderStatus);
router.delete('/:id', adminOnly, deleteOrder);

export default router;

