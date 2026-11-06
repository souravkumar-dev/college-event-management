import mongoose from 'mongoose';

export default async function connectDB(uri = process.env.MONGO_URI) {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected: ${uri.includes('mongodb+srv') ? 'MongoDB Atlas' : uri}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    throw err;
  }
}
