import mongoose from 'mongoose';

const LOCAL_URI = 'mongodb://127.0.0.1:27017/dodos_phones_accessories';

const connectDB = async () => {
  const uri = process.env.MONGO_URI || LOCAL_URI;

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`   Ensure MongoDB Compass / local MongoDB is running on port 27017`);
    process.exit(1);
  }
};

export default connectDB;

