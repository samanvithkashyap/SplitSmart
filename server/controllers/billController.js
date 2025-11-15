import dayjs from 'dayjs';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Bill } from '../models/Bill.js';
import { Notification } from '../models/Notification.js';
import { HttpError } from '../utils/httpError.js';
import { billSchema, billSettleSchema, billReminderSchema } from '../validation/schemas.js';

const { Types } = mongoose;

const hydrateStatus = (bill) => ({
  ...bill.toObject(),
  status: bill.participants.every((p) => p.settled) ? 'settled' : 'open',
});

export const listBills = asyncHandler(async (req, res) => {
  const filter = {};
  const bills = await Bill.find(filter).sort({ dueDate: 1 });
  const statusFilter = req.query.status;
  const data = bills
    .map(hydrateStatus)
    .filter((bill) => (statusFilter ? bill.status === statusFilter : true));
  res.json({ bills: data });
});

export const createBill = asyncHandler(async (req, res) => {
  const payload = billSchema.parse({
    ...req.body,
    total: Number(req.body.total),
    participants: (req.body.participants || []).map((p) => ({
      ...p,
      share: Number(p.share),
    })),
  });

  const totalShares = payload.participants.reduce((acc, p) => acc + p.share, 0);
  if (Math.abs(totalShares - payload.total) > 0.01) {
    throw new HttpError(400, 'Participant shares must equal total');
  }

  const bill = await Bill.create({
    creatorId: null,
    description: payload.description,
    total: payload.total,
    participants: payload.participants.map((p) => ({
      userId: p.userId ? new Types.ObjectId(p.userId) : null,
      name: p.name,
      share: p.share,
      settled: false,
    })),
    dueDate: payload.dueDate ? dayjs(payload.dueDate).toDate() : undefined,
  });

  res.status(201).json({ bill: hydrateStatus(bill) });
});

export const settleShare = asyncHandler(async (req, res) => {
  const { participantId } = billSettleSchema.parse(req.body);
  const bill = await Bill.findById(req.params.id);
  if (!bill) throw new HttpError(404, 'Bill not found');

  const participant = bill.participants.find((p) => p.userId.toString() === participantId);
  if (!participant) throw new HttpError(404, 'Participant not part of bill');

  participant.settled = true;
  await bill.save();

  res.json({ bill: hydrateStatus(bill) });
});

export const sendReminder = asyncHandler(async (req, res) => {
  const payload = billReminderSchema.parse(req.body || {});
  const bill = await Bill.findById(req.params.id).populate('participants.userId');
  if (!bill) throw new HttpError(404, 'Bill not found');

  const dueSoon = bill.dueDate ? dayjs(bill.dueDate).diff(dayjs(), 'day') <= 3 : false;
  const message =
    payload.message ||
    `Reminder: ${bill.description} (${bill.total.toFixed(2)}) is due ${bill.dueDate ? dayjs(bill.dueDate).format('MMM D') : 'soon'}.`;

  const notifications = bill.participants
    .filter((p) => !p.settled)
    .map((p) => ({
      userId: p.userId._id,
      type: dueSoon ? 'urgent' : 'reminder',
      title: 'Bill Reminder',
      body: message,
    }));

  if (notifications.length) {
    await Notification.insertMany(notifications);
  }

  bill.reminderSent = true;
  await bill.save();

  res.json({ message: 'Reminder sent' });
});

export const deleteBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) throw new HttpError(404, 'Bill not found');

  await Bill.findByIdAndDelete(req.params.id);

  res.json({ message: 'Bill deleted successfully' });
});
