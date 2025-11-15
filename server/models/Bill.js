import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    name: { type: String, required: true },
    share: { type: Number, required: true },
    settled: { type: Boolean, default: false },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    description: { type: String, required: true },
    total: { type: Number, required: true },
    participants: { type: [participantSchema], default: [] },
    dueDate: { type: Date },
    reminderSent: { type: Boolean, default: false },
    attachments: { type: [String], default: [] },
    status: { type: String, enum: ['open', 'settled'], default: 'open' },
  },
  { timestamps: true }
);

export const Bill = mongoose.model('Bill', billSchema);
