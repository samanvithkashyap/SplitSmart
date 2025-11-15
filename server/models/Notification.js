import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    type: { type: String, default: 'info' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    cta: { type: String },
    read: { type: Boolean, default: false },
    scheduledFor: { type: Date, default: Date.now },
    channel: { type: String, enum: ['in-app', 'email'], default: 'in-app' },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
