import mongoose from 'mongoose';

const preferenceSchema = new mongoose.Schema(
  {
    currency: { type: String, default: 'USD' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatarColor: { type: String, default: '#8b5cf6' },
    monthlyBudget: { type: Number, default: 0 },
    preferences: { type: preferenceSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
