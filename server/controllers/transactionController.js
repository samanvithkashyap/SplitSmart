import dayjs from 'dayjs';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Transaction } from '../models/Transaction.js';
import { HttpError } from '../utils/httpError.js';
import { transactionFilterSchema } from '../validation/schemas.js';

export const listTransactions = asyncHandler(async (req, res) => {
  const filters = transactionFilterSchema.parse(req.query);
  const query = {};

  if (filters.category) query.category = filters.category;
  if (filters.start || filters.end) {
    query.createdAt = {};
    if (filters.start) query.createdAt.$gte = dayjs(filters.start).startOf('day').toDate();
    if (filters.end) query.createdAt.$lte = dayjs(filters.end).endOf('day').toDate();
  }

  const transactions = await Transaction.find(query).sort({ createdAt: -1 });
  res.json({ transactions });
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) throw new HttpError(404, 'Transaction not found');
  transaction.notes = req.body.notes ?? transaction.notes;
  await transaction.save();
  res.json({ transaction });
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  const deleted = await Transaction.findByIdAndDelete(req.params.id);
  if (!deleted) throw new HttpError(404, 'Transaction not found');
  res.json({ message: 'Transaction removed' });
});
