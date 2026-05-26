import Category from '../models/Category.js';
import Product from '../models/Product.js';

/**
 * @desc    Get all categories (for public)
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    
    // Enrich with actual product counts
    const enriched = await Promise.all(categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat.name });
      return { ...cat.toObject(), productCount: count };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Get all categories (for admin - including inactive)
 * @route   GET /api/categories/admin
 * @access  Private/Admin
 */
export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    
    // Enrich with actual product counts
    const enriched = await Promise.all(categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat.name });
      return { ...cat.toObject(), productCount: count };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Create a category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = async (req, res) => {
  try {
    const { name, slug, icon, image, description, subcategories, order, isActive, highlightedHome } = req.body;

    // Explicit check: Only admin can add category with image
    if (image && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can add categories with images' });
    }

    const categoryExists = await Category.findOne({ slug });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      icon,
      image,
      description,
      subcategories,
      order,
      isActive,
      highlightedHome: highlightedHome === true
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid category data' });
  }
};

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = async (req, res) => {
  try {
    const { name, slug, icon, image, description, subcategories, order, isActive, highlightedHome } = req.body;

    // Explicit check: Only admin can update category with image
    if (image && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update categories with images' });
    }

    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = name || category.name;
      category.slug = slug || category.slug;
      category.icon = icon || category.icon;
      category.image = image || category.image;
      category.description = description || category.description;
      category.subcategories = subcategories || category.subcategories;
      category.order = order !== undefined ? order : category.order;
      category.isActive = isActive !== undefined ? isActive : category.isActive;
      category.highlightedHome = highlightedHome !== undefined ? highlightedHome : category.highlightedHome;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid category data' });
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
