import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    fullName: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    additionalDetails: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    registrationDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One registration document per student per event
registrationSchema.index({ studentId: 1, eventId: 1 }, { unique: true });

export default mongoose.model('Registration', registrationSchema);
