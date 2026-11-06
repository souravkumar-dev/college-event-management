import mongoose from 'mongoose';

// const LOCAL_FALLBACK_URI = 'mongodb://127.0.0.1:27017/cems';

export default async function connectDB(uri = process.env.MONGO_URI) {
  const targetUri = uri;
  try {
    await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected: ${targetUri.includes('mongodb+srv') ? 'MongoDB Atlas' : targetUri}`);
  } catch (err) {
    if (targetUri !== LOCAL_FALLBACK_URI) {
      console.warn(`Primary MongoDB connection failed (${err.message}). Trying local fallback at ${LOCAL_FALLBACK_URI}...`);
      try {
        await mongoose.connect(LOCAL_FALLBACK_URI, { serverSelectionTimeoutMS: 3000 });
        console.log(`Connected to local fallback MongoDB: ${LOCAL_FALLBACK_URI}`);
        return;
      } catch (fallbackErr) {
        console.error(`Local MongoDB fallback also failed: ${fallbackErr.message}`);
      }
    }
    throw err;
  }
}
