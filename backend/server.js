import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import User from './models/User.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import slideRoutes from './routes/slideRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import repairRoutes from './routes/repairRoutes.js';
import subscriberRoutes from './routes/subscriberRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5008;

// Connect to MongoDB
connectDB();

// Ensure admin account exists on every startup
const ensureAdminExists = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dodos.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      await User.create({
        fullName: 'Admin',
        email: adminEmail,
        phone: '+250780000000',
        password: adminPassword,
        role: 'admin',
        isVerified: true,
      });
      console.log(`✅ Admin account created: ${adminEmail}`);
    } else if (!admin.isVerified || admin.role !== 'admin') {
      admin.isVerified = true;
      admin.role = 'admin';
      await admin.save();
      console.log(`✅ Admin account updated: ${adminEmail}`);
    }
  } catch (err) {
    console.error('❌ Failed to ensure admin account:', err.message);
  }
};

// Run after DB connects
setTimeout(ensureAdminExists, 2000);

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Increased limit for polling
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/slides', slideRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'DODOS ELECTRO STORE API is running' });
});

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

