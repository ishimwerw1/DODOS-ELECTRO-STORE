import express from 'express';
const router = express.Router();
import { 
  getCategories, 
  getAllCategoriesAdmin,
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';

router.route('/')
  .get(getCategories)
  .post(protect, adminOnly, createCategory);

router.route('/admin')
  .get(protect, adminOnly, getAllCategoriesAdmin);

router.route('/:id')
  .put(protect, adminOnly, updateCategory)
  .delete(protect, adminOnly, deleteCategory);

export default router;
