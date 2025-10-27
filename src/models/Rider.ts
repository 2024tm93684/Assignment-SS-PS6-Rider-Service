import mongoose, { Document, Schema } from 'mongoose';

// Rider interface for TypeScript
export interface IRider extends Document {
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Rider schema
const RiderSchema = new Schema<IRider>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'Phone number must be 10 digits']
    }
  },
  {
    timestamps: true // automatically adds createdAt and updatedAt
  }
);

// Create and export the model
export default mongoose.model<IRider>('Rider', RiderSchema);

