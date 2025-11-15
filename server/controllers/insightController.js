import dayjs from 'dayjs';
import { asyncHandler } from '../utils/asyncHandler.js';
import { InsightCache } from '../models/InsightCache.js';
import { Transaction } from '../models/Transaction.js';

const periodToRange = (period) => {
  const start = dayjs(period, 'YYYY-MM').startOf('month');
  const end = start.endOf('month');
  return { start: start.toDate(), end: end.toDate() };
};

const computeInsights = async (period) => {
  const { start, end } = periodToRange(period);
  const transactions = await Transaction.find({
    createdAt: { $gte: start, $lte: end },
  });

  const spendByCategory = transactions.reduce((acc, tx) => {
    const key = tx.category || 'uncategorized';
    acc[key] = (acc[key] || 0) + tx.amount;
    return acc;
  }, {});

  const expenses = transactions.filter((tx) => tx.direction === 'debit').reduce((acc, tx) => acc + tx.amount, 0);
  const credits = transactions.filter((tx) => tx.direction === 'credit').reduce((acc, tx) => acc + tx.amount, 0);
  const savingsRate = credits ? Math.max(0, ((credits - expenses) / credits) * 100) : 0;

  const recommendations = [];
  if (expenses > credits * 0.8) {
    recommendations.push('Your spending is trending high this month. Revisit discretionary categories.');
  }
  if (!recommendations.length) {
    recommendations.push('Great balance! Consider increasing your automated savings transfer.');
  }

  const cache = await InsightCache.findOneAndUpdate(
    { period },
    {
      period,
      spendByCategory,
      monthlySummary: { income: credits, expenses, savingsRate },
      recommendations,
      generatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return cache;
};

export const getOverview = asyncHandler(async (req, res) => {
  const period = req.query.period || dayjs().format('YYYY-MM');
  let insight = await InsightCache.findOne({ period });
  if (!insight) {
    insight = await computeInsights(period);
  }
  res.json({ insight });
});

export const getRecommendations = asyncHandler(async (req, res) => {
  const period = req.query.period || dayjs().format('YYYY-MM');
  let insight = await InsightCache.findOne({ period });
  if (!insight) {
    insight = await computeInsights(period);
  }
  res.json({ recommendations: insight.recommendations });
});

export const recalculateInsights = asyncHandler(async (req, res) => {
  const period = req.body.period || dayjs().format('YYYY-MM');
  const insight = await computeInsights(period);
  res.json({ insight, message: 'Insights regenerated' });
});
