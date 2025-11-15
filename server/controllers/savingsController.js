import dayjs from 'dayjs';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SavingsGoal } from '../models/SavingsGoal.js';
import { HttpError } from '../utils/httpError.js';
import { savingsGoalSchema, savingsProgressSchema } from '../validation/schemas.js';

export const listGoals = asyncHandler(async (req, res) => {
  const goals = await SavingsGoal.find({}).sort({ createdAt: -1 });
  res.json({ goals });
});

export const createGoal = asyncHandler(async (req, res) => {
  const payload = savingsGoalSchema.parse({
    ...req.body,
    targetAmount: Number(req.body.targetAmount),
    currentAmount: Number(req.body.currentAmount || 0),
  });

  const goal = await SavingsGoal.create({
    userId: null,
    label: payload.label,
    targetAmount: payload.targetAmount,
    currentAmount: payload.currentAmount,
    deadline: payload.deadline ? dayjs(payload.deadline).toDate() : undefined,
  });

  res.status(201).json({ goal });
});

export const updateGoal = asyncHandler(async (req, res) => {
  const payload = savingsGoalSchema.partial().parse(req.body);
  const goal = await SavingsGoal.findOne({ _id: req.params.id });
  if (!goal) throw new HttpError(404, 'Goal not found');

  Object.assign(goal, {
    ...payload,
    deadline: payload.deadline ? dayjs(payload.deadline).toDate() : goal.deadline,
  });

  await goal.save();
  res.json({ goal });
});

export const addProgress = asyncHandler(async (req, res) => {
  const payload = savingsProgressSchema.parse({
    ...req.body,
    amount: Number(req.body.amount),
  });

  const goal = await SavingsGoal.findOne({ _id: req.params.id });
  if (!goal) throw new HttpError(404, 'Goal not found');

  goal.currentAmount += payload.amount;
  goal.history.push({ amount: payload.amount, date: new Date() });
  const percent = goal.targetAmount ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  if (percent >= 100) {
    goal.tips = ['Amazing! Consider setting a new stretch goal.'];
  } else if (percent >= 50 && !goal.tips.length) {
    goal.tips = ['Great traction—schedule auto-transfers to keep momentum.'];
  }

  await goal.save();
  res.json({ goal, percent: Math.min(100, Math.round(percent)) });
});

export const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findById(req.params.id);
  if (!goal) throw new HttpError(404, 'Goal not found');

  await SavingsGoal.findByIdAndDelete(req.params.id);

  res.json({ message: 'Goal deleted successfully' });
});
