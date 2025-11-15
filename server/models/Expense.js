import mongoose from 'mongoose';

const splitSchema = new mongoose.Schema(
  {
    participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    share: { type: Number, required: true },
    settled: { type: Boolean, default: false },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, default: 'general' },
    type: { type: String, enum: ['personal', 'group'], default: 'personal' },
    splitWith: { type: [splitSchema], default: [] },
    date: { type: Date, default: Date.now },
    notes: { type: String },
    status: { type: String, enum: ['recorded', 'pending', 'reimbursed'], default: 'recorded' },
  },
  { timestamps: true }
);

export const Expense = mongoose.model('Expense', expenseSchema);
