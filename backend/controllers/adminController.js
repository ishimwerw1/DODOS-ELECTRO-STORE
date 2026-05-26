import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Settings from '../models/Settings.js';
import Category from '../models/Category.js';

/* ─────────────────────────────────────────────
   STOCK MANAGEMENT
───────────────────────────────────────────── */

// @desc  Full stock report — all products with sold qty & remaining
// @route GET /api/admin/stock
export const getStockReport = async (req, res) => {
  try {
    const products = await Product.find().lean();

    // Aggregate sold quantities from completed orders
    const soldAgg = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          soldQty:  { $sum: '$items.quantity' },
          revenue:  { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
    ]);

    const soldMap = {};
    soldAgg.forEach(s => { soldMap[String(s._id)] = { soldQty: s.soldQty, revenue: s.revenue }; });

    const report = products.map(p => {
      const sold = soldMap[String(p._id)] || { soldQty: 0, revenue: 0 };
      return {
        _id:        p._id,
        name:       p.name,
        brand:      p.brand,
        category:   p.category,
        image:      p.image,
        price:      p.price,
        stock:      p.stock,          // current remaining
        soldQty:    sold.soldQty,
        revenue:    sold.revenue,
        totalEver:  p.stock + sold.soldQty, // original stock = remaining + sold
        status:
          p.stock === 0 ? 'out_of_stock' :
          p.stock <= 5  ? 'critical' :
          p.stock <= 15 ? 'low' : 'ok',
      };
    });

    // Summary
    const summary = {
      totalProducts:   products.length,
      totalStock:      products.reduce((a, p) => a + p.stock, 0),
      totalSold:       soldAgg.reduce((a, s) => a + s.soldQty, 0),
      totalRevenue:    soldAgg.reduce((a, s) => a + s.revenue, 0),
      outOfStock:      report.filter(r => r.status === 'out_of_stock').length,
      criticalStock:   report.filter(r => r.status === 'critical').length,
      lowStock:        report.filter(r => r.status === 'low').length,
    };

    res.json({ success: true, summary, products: report });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stock report', error: err.message });
  }
};

// @desc  Update stock for a single product
// @route PUT /api/admin/stock/:id
export const updateStock = async (req, res) => {
  try {
    const { stock, note } = req.body;
    if (stock === undefined || stock < 0) return res.status(400).json({ message: 'Invalid stock value' });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: Number(stock) },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: 'Error updating stock', error: err.message });
  }
};

// @desc  Bulk restock multiple products
// @route POST /api/admin/stock/bulk
export const bulkRestock = async (req, res) => {
  try {
    const { updates } = req.body; // [{ productId, addQty }]
    if (!Array.isArray(updates)) return res.status(400).json({ message: 'updates must be an array' });

    const results = await Promise.all(
      updates.map(({ productId, addQty }) =>
        Product.findByIdAndUpdate(
          productId,
          { $inc: { stock: Number(addQty) } },
          { new: true }
        )
      )
    );

    res.json({ success: true, updated: results.filter(Boolean).length });
  } catch (err) {
    res.status(500).json({ message: 'Error bulk restocking', error: err.message });
  }
};

// @desc  Sales report by date range
// @route GET /api/admin/stock/sales-report?from=&to=&groupBy=day|week|month
export const getSalesReport = async (req, res) => {
  try {
    const { from, to, groupBy = 'day' } = req.query;

    const matchStage = { status: 'Completed' };
    if (from || to) {
      matchStage.createdAt = {};
      if (from) matchStage.createdAt.$gte = new Date(from);
      if (to)   matchStage.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59));
    }

    const dateFormat =
      groupBy === 'month' ? '%Y-%m' :
      groupBy === 'week'  ? '%Y-W%V' : '%Y-%m-%d';

    const salesByDate = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id:     { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top selling products in range
    const topProducts = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id:     '$items.product',
          name:    { $first: '$items.name' },
          soldQty: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { soldQty: -1 } },
      { $limit: 10 },
    ]);

    // Category breakdown
    const categoryBreakdown = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id:     '$productInfo.category',
          soldQty: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Totals
    const totals = salesByDate.reduce(
      (acc, d) => ({ revenue: acc.revenue + d.revenue, orders: acc.orders + d.orders }),
      { revenue: 0, orders: 0 }
    );

    res.json({
      success: true,
      totals,
      salesByDate,
      topProducts,
      categoryBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error generating sales report', error: err.message });
  }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSystemSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSystemSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      // Deep merge or specific updates
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

// @desc    Reset settings to default
// @route   POST /api/admin/settings/reset
// @access  Private/Admin
export const resetSettings = async (req, res) => {
  try {
    await Settings.deleteMany({});
    const settings = await Settings.create({});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error resetting settings', error: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const lowStockItems = await Product.countDocuments({ stock: { $lt: 10 } });

    // Calculate total revenue from Completed orders
    const completedOrders = await Order.find({ status: 'Completed' });
    const totalRevenue = completedOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    // Sales per day (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const salesHistoryAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days },
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format sales history to include all 7 days even with 0 sales
    const salesHistory = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = salesHistoryAgg.find(s => s._id === dateStr);
      salesHistory.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateStr,
        sales: dayData ? dayData.revenue : 0
      });
    }

    // Low stock alerts (less than 10)
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).select('name stock image');

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Top selling products (by quantity sold in completed orders)
    const topProductsAgg = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          soldQty: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { soldQty: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      summary: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
        pendingOrders,
        lowStockItems
      },
      salesHistory,
      lowStockProducts,
      recentOrders,
      topProducts: topProductsAgg
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' }).select('-password').lean();
    
    // Enrich customers with order stats
    const enriched = await Promise.all(customers.map(async (customer) => {
      const orders = await Order.find({ user: customer._id });
      const totalSpent = orders
        .filter(o => o.status === 'Completed')
        .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
      
      return {
        ...customer,
        orderCount: orders.length,
        totalSpent
      };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
};

/* ─────────────────────────────────────────────
   CATEGORY MANAGEMENT
───────────────────────────────────────────── */

// @desc    Get all categories for admin
// @route   GET /api/admin/categories
export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    // Enrich with actual product counts
    const enriched = await Promise.all(categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat.name });
      return { ...cat.toObject(), productCount: count };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// @desc    Add new category
// @route   POST /api/admin/categories
export const addCategory = async (req, res) => {
  try {
    const { name, description, image, subcategories, highlightedHome } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    // Explicit check: Only admin can add category with image
    if (image && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can add categories with images' });
    }

    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Category already exists' });

    const category = await Category.create({
      name,
      description,
      image,
      subcategories: Array.isArray(subcategories) ? subcategories : [],
      highlightedHome: highlightedHome === true
    });

    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ message: 'Error adding category', error: err.message });
  }
};

// @desc    Update category (updates all products in that category if name changed)
// @route   PUT /api/admin/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, subcategories, highlightedHome, isActive } = req.body;
    
    // Explicit check: Only admin can update category with image
    if (image && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update categories with images' });
    }

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const oldName = category.name;

    // Update the category model
    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.image = image !== undefined ? image : category.image;
    category.subcategories = Array.isArray(subcategories) ? subcategories : category.subcategories;
    category.highlightedHome = highlightedHome !== undefined ? highlightedHome : category.highlightedHome;
    category.isActive = isActive !== undefined ? isActive : category.isActive;
    
    await category.save();

    // If name changed, update all products
    if (name && name !== oldName) {
      await Product.updateMany(
        { category: oldName },
        { $set: { category: name } }
      );
    }

    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ message: 'Error updating category', error: err.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const catName = category.name;
    await Category.findByIdAndDelete(id);

    // Unset the category from products
    await Product.updateMany(
      { category: catName },
      { $set: { category: 'Uncategorized' } }
    );

    res.json({ success: true, message: `Category ${catName} deleted` });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting category', error: err.message });
  }
};
