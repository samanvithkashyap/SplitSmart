import mongoose from 'mongoose';

const insightCacheSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    period: { type: String, required: true },
    spendByCategory: { type: Map, of: Number, default: {} },
    monthlySummary: {
      income: { type: Number, default: 0 },
      expenses: { type: Number, default: 0 },
      savingsRate: { type: Number, default: 0 },
    },
    recommendations: { type: [String], default: [] },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

insightCacheSchema.index({ userId: 1, period: 1 }, { unique: true });

export const InsightCache = mongoose.model('InsightCache', insightCacheSchema);
