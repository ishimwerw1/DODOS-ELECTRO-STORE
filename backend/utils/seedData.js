import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const LOCAL_URI = 'mongodb://127.0.0.1:27017/dodos_phones_accessories';

// Ensure we use the right URI
process.env.MONGO_URI = process.env.MONGO_URI || LOCAL_URI;

const sampleProducts = [
  {
    name: 'Premium Silicone Case - iPhone 14',
    price: 15000,
    brand: 'DODOS',
    category: 'Phone Cases',
    compatible: 'iPhone 14',
    image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=400',
    discount: 10,
    rating: 4.5,
    stock: 50,
    description: 'Premium silicone case with soft-touch finish and raised edges for screen protection.'
  },
  {
    name: 'Clear TPU Case - Samsung S23',
    price: 12000,
    brand: 'DODOS',
    category: 'Phone Cases',
    compatible: 'Samsung Galaxy S23',
    image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=400',
    discount: 0,
    rating: 4.2,
    stock: 40,
    description: 'Crystal clear TPU case that shows off your phone while protecting it.'
  },
  {
    name: 'Fast Charger 65W - USB-C',
    price: 35000,
    brand: 'Anker',
    category: 'Chargers',
    compatible: 'Universal USB-C',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400',
    discount: 15,
    rating: 4.8,
    stock: 30,
    description: '65W GaN fast charger with multiple ports for all your devices.'
  },
  {
    name: 'Wireless Charging Pad',
    price: 25000,
    brand: 'DODOS',
    category: 'Chargers',
    compatible: 'Universal Qi',
    image: 'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=400',
    discount: 5,
    rating: 4.3,
    stock: 25,
    description: 'Sleek wireless charging pad with LED indicator and non-slip surface.'
  },
  {
    name: 'ANC Wireless Earbuds',
    price: 85000,
    brand: 'DODOS Audio',
    category: 'Headphones',
    compatible: 'Universal Bluetooth',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    discount: 20,
    rating: 4.7,
    stock: 20,
    description: 'Active noise cancelling wireless earbuds with 30-hour battery life.'
  },
  {
    name: 'Sport Earphones - Wired',
    price: 18000,
    brand: 'DODOS Audio',
    category: 'Headphones',
    compatible: '3.5mm Jack',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
    discount: 0,
    rating: 4.0,
    stock: 60,
    description: 'Sweat-resistant sport earphones with secure fit and deep bass.'
  },
  {
    name: 'Tempered Glass - iPhone 14 Pro',
    price: 10000,
    brand: 'DODOS',
    category: 'Screen Protectors',
    compatible: 'iPhone 14 Pro',
    image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=400',
    discount: 0,
    rating: 4.6,
    stock: 100,
    description: '9H hardness tempered glass with oleophobic coating and easy install kit.'
  },
  {
    name: 'Privacy Screen Protector - Samsung',
    price: 15000,
    brand: 'DODOS',
    category: 'Screen Protectors',
    compatible: 'Samsung Galaxy S23',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
    discount: 10,
    rating: 4.4,
    stock: 45,
    description: 'Privacy screen protector that prevents side viewing.'
  },
  {
    name: 'Smart Watch Band - Silicone',
    price: 12000,
    brand: 'DODOS',
    category: 'Smart Accessories',
    compatible: 'Apple Watch / Samsung Watch',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
    discount: 0,
    rating: 4.3,
    stock: 35,
    description: 'Comfortable silicone smart watch band available in multiple colors.'
  },
  {
    name: 'Phone Ring Holder & Stand',
    price: 8000,
    brand: 'DODOS',
    category: 'Smart Accessories',
    compatible: 'Universal',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400',
    discount: 0,
    rating: 4.1,
    stock: 80,
    description: '360° rotating ring holder that doubles as a stand.'
  },
  {
    name: 'Leather Wallet Case - iPhone 14',
    price: 28000,
    brand: 'DODOS Luxe',
    category: 'Phone Cases',
    compatible: 'iPhone 14',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    discount: 0,
    rating: 4.7,
    stock: 15,
    description: 'Genuine leather wallet case with card slots and magnetic closure.'
  },
  {
    name: 'Car Phone Mount',
    price: 18000,
    brand: 'DODOS',
    category: 'Smart Accessories',
    compatible: 'Universal',
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400',
    discount: 10,
    rating: 4.2,
    stock: 40,
    description: 'Dashboard car mount with strong suction and 360° rotation.'
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing products
    await Product.deleteMany();
    console.log('🗑️  Cleared existing products');

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log('✅ Seeded products successfully');

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@dodoselectrostore.com' });
    if (!adminExists) {
      await User.create({
        fullName: 'Admin User',
        email: 'admin@dodoselectrostore.com',
        phone: '+250780000000',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created (admin@dodoselectrostore.com / admin123)');
    }

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();

