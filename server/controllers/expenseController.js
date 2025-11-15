import dayjs from 'dayjs';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Expense } from '../models/Expense.js';
import { Transaction } from '../models/Transaction.js';
import { HttpError } from '../utils/httpError.js';
import { expenseCreateSchema, expenseUpdateSchema } from '../validation/schemas.js';

const { Types } = mongoose;

const buildExpenseFilter = (query) => {
  const filter = {};

  if (query.category) filter.category = query.category;
  if (query.type) filter.type = query.type;

  if (query.start || query.end) {
    filter.date = {};
    if (query.start) {
      filter.date.$gte = dayjs(query.start).startOf('day').toDate();
    }
    if (query.end) {
      filter.date.$lte = dayjs(query.end).endOf('day').toDate();
    }
  }

  return filter;
};

export const listExpenses = asyncHandler(async (req, res) => {
  const filter = buildExpenseFilter(req.query);
  const expenses = await Expense.find(filter).sort({ date: -1 });
  res.json({ expenses });
});

export const createExpense = asyncHandler(async (req, res) => {
  const payload = expenseCreateSchema.parse({
    ...req.body,
    amount: Number(req.body.amount),
  });

  const expense = await Expense.create({
    ownerId: null,
    title: payload.title,
    amount: payload.amount,
    category: payload.category,
    type: payload.type,
    date: payload.date ? dayjs(payload.date).toDate() : new Date(),
    notes: payload.notes,
    splitWith: (payload.splitWith || []).map((entry) => ({
      participantId: new Types.ObjectId(entry.participantId),
      share: entry.share,
      settled: entry.settled ?? false,
    })),
  });

  await Transaction.create({
    userId: null,
    expenseId: expense._id,
    direction: 'debit',
    amount: payload.amount,
    category: payload.category,
    participants: expense.splitWith.map((s) => s.participantId),
    notes: payload.notes,
  });

  res.status(201).json({ expense });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const payload = expenseUpdateSchema.parse(req.body);
  const expense = await Expense.findOne({ _id: req.params.id });
  if (!expense) throw new HttpError(404, 'Expense not found');

  Object.assign(expense, {
    ...payload,
    date: payload.date ? dayjs(payload.date).toDate() : expense.date,
    splitWith: payload.splitWith
      ? payload.splitWith.map((entry) => ({
          participantId: new Types.ObjectId(entry.participantId),
          share: entry.share,
          settled: entry.settled ?? false,
        }))
      : expense.splitWith,
  });

  await expense.save();
  await Transaction.updateMany(
    { expenseId: expense._id },
    {
      $set: {
        amount: expense.amount,
        category: expense.category,
        notes: expense.notes,
        participants: expense.splitWith.map((s) => s.participantId),
      },
    }
  );

  res.json({ expense });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id });
  if (!expense) throw new HttpError(404, 'Expense not found');
  await Transaction.deleteMany({ expenseId: expense._id });
  res.json({ message: 'Expense removed' });
});
