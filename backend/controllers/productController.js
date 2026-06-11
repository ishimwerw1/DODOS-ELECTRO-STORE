import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    let { category, brand, compatible, search, minPrice, maxPrice, sort } = req.query;
    const filters = [];

    if (category) {
      // Check if category is an ObjectId (24 hex chars)
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        const catDoc = await Category.findById(category);
        if (catDoc) {
          category = catDoc.name;
        }
      }
      filters.push({ category });
    }

    // subcategory filter
    const { subcategory } = req.query;
    if (subcategory) {
      filters.push({ subcategory });
    }

    if (brand) {
      const brands = brand.split(',').map((b) => b.trim()).filter(Boolean);
      if (brands.length > 1) {
        filters.push({
          $or: brands.map((item) => ({ brand: { $regex: item, $options: 'i' } }))
        });
      } else {
        filters.push({ brand: { $regex: brands[0], $options: 'i' } });
      }
    }

    if (compatible) {
      filters.push({ compatible: { $regex: compatible, $options: 'i' } });
    }

    if (search) {
      filters.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    if (minPrice || maxPrice) {
      const priceQuery = {};
      if (minPrice) priceQuery.$gte = Number(minPrice);
      if (maxPrice) priceQuery.$lte = Number(maxPrice);
      filters.push({ price: priceQuery });
    }

    const query = filters.length ? { $and: filters } : {};

    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'rating') sortOption.rating = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;

    const products = await Product.find(query).sort(sortOption);
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    // Notify users who allow notifications for new arrivals
    const usersToNotify = await User.find({ 
      role: 'user', 
      'notifications.newArrivals': true 
    });
    
    if (usersToNotify.length > 0) {
      const notifications = usersToNotify.map(user => ({
        recipient: user._id,
        title: 'New Product Added!',
        message: `Check out our new ${product.name} now available in the store.`,
        type: 'PRODUCT_ADDED',
        relatedId: product._id
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories with details
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    // If no categories in model yet, fall back to distinct products
    if (categories.length === 0) {
      const distinct = await Product.distinct('category');
      return res.json(distinct.map(name => ({ name, productCount: 0 })));
    }

    // Enrich with actual product counts
    const enriched = await Promise.all(categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat.name });
      return { ...cat.toObject(), productCount: count };
    }));

    res.json(enriched);
  } catch (error) {
    next(error);
  }
};

