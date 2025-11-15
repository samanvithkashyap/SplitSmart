import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    expenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
    direction: { type: String, enum: ['debit', 'credit'], default: 'debit' },
    amount: { type: Number, required: true },
    category: { type: String },
    participants: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model('Transaction', transactionSchema);
