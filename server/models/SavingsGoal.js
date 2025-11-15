import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    label: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date },
    tips: { type: [String], default: [] },
    history: { type: [historySchema], default: [] },
  },
  { timestamps: true }
);

export const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);
