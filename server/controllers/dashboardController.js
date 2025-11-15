import dayjs from 'dayjs';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Expense } from '../models/Expense.js';
import { Bill } from '../models/Bill.js';
import { SavingsGoal } from '../models/SavingsGoal.js';
import { InsightCache } from '../models/InsightCache.js';
import { Notification } from '../models/Notification.js';
import { Transaction } from '../models/Transaction.js';

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const period = dayjs().format('YYYY-MM');

  const [recentExpenses, outstandingBills, goals, insights, notifications, monthlyTotals] = await Promise.all([
    Expense.find({}).sort({ createdAt: -1 }).limit(5),
    Bill.find({})
      .sort({ dueDate: 1 })
      .limit(5),
    SavingsGoal.find({}).limit(3),
    InsightCache.findOne({ period }),
    Notification.find({ read: false }).sort({ createdAt: -1 }).limit(5),
    Transaction.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]),
  ]);

  const spend = recentExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  const outstanding = outstandingBills.reduce((acc, bill) => acc + bill.total, 0);

  res.json({
    recentExpenses,
    outstandingBills,
    goals,
    notifications,
    monthlyTotals,
    summary: {
      monthlySpend: spend,
      outstanding,
      savingsRate: insights?.monthlySummary?.savingsRate || 0,
    },
    recommendations: insights?.recommendations || [
      'Review entertainment subscriptions to trim costs',
      'Add a recurring transfer toward your goals',
    ],
  });
});

export const getQuickActions = asyncHandler(async (_req, res) => {
  res.json({
    actions: [
      { id: 'add-expense', label: 'Add Expense', href: '/app/expenses/new', variant: 'primary' },
      { id: 'split-bill', label: 'Split Bill', href: '/app/bills/new', variant: 'secondary' },
      { id: 'new-goal', label: 'New Savings Goal', href: '/app/savings/new', variant: 'outline' },
      { id: 'manage-reminders', label: 'Manage Reminders', href: '/app/notifications', variant: 'ghost' },
    ],
  });
});
