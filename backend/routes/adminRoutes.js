import express from 'express';
import {
  getDashboardStats,
  getAllCustomers,
  getSystemSettings,
  updateSystemSettings,
  resetSettings,
  getStockReport,
  updateStock,
  bulkRestock,
  getSalesReport,
} from '../controllers/adminController.js';
import {
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get('/stats',              getDashboardStats);
router.get('/customers',          getAllCustomers);
router.get('/settings',           getSystemSettings);
router.put('/settings',           updateSystemSettings);
router.post('/settings/reset',    resetSettings);

// Stock management
router.get('/stock',              getStockReport);
router.put('/stock/:id',          updateStock);
router.post('/stock/bulk',        bulkRestock);
router.get('/stock/sales-report', getSalesReport);

// Category Management
router.get('/categories',         getAllCategoriesAdmin);
router.post('/categories',        createCategory);
router.put('/categories/:id',     updateCategory);
router.delete('/categories/:id',  deleteCategory);

export default router;
