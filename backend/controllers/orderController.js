import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Create order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { deliveryInfo, items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No items in order');
    }

    // Verify stock and update
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.name}`);
      }
      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      deliveryInfo,
      totalAmount,
      deliveryFee: deliveryInfo?.district === 'Kigali' ? 0 : 2000,
      paymentMethod: deliveryInfo?.paymentMethod || 'mobile_money',
      momoNumber: deliveryInfo?.momoNumber || '',
      status: 'Pending'
    });

    // Notify Admins about new order
    const admins = await User.find({ role: 'admin' });
    const adminNotifications = admins.map(admin => ({
      recipient: admin._id,
      sender: req.user.id,
      title: 'New Order Placed',
      message: `User ${req.user.fullName} placed a new order of RWF ${totalAmount}.`,
      type: 'ORDER_PLACED',
      relatedId: order._id
    }));
    await Notification.insertMany(adminNotifications);

    // Clear user cart after order
    await Cart.findOneAndDelete({ user: req.user.id });

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('items.product');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/all
// @access  Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'fullName email')
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'fullName email').populate('items.product');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order (admin)
// @route   DELETE /api/orders/:id
// @access  Admin
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    res.json({ success: true, message: 'Order removed' });
  } catch (error) {
    next(error);
  }
};


