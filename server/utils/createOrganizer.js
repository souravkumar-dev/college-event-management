// Organizer accounts are created by an administrator from the command line, never by public sign-up.
// Usage: npm run create-organizer -- "Name" email@college.edu.in password
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password) {
  console.log('Usage: npm run create-organizer -- "Name" email password');
  process.exit(1);
}
await connectDB();
const existing = await User.findOne({ email: email.toLowerCase() });
if (existing) {
  existing.role = 'organizer';
  await existing.save();
  console.log(`Existing user ${email} promoted to organizer`);
} else {
  await User.create({ name, email, password, role: 'organizer' });
  console.log(`Organizer ${email} created`);
}
await mongoose.disconnect();
