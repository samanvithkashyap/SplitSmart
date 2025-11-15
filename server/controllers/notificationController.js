import { asyncHandler } from '../utils/asyncHandler.js';
import { Notification } from '../models/Notification.js';
import { HttpError } from '../utils/httpError.js';
import { notificationTestSchema } from '../validation/schemas.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({}).sort({ createdAt: -1 });
  res.json({ notifications });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new HttpError(404, 'Notification not found');
  notification.read = true;
  await notification.save();
  res.json({ notification });
});

export const createTestNotification = asyncHandler(async (req, res) => {
  const payload = notificationTestSchema.parse(req.body);
  const notification = await Notification.create({
    type: payload.type,
    title: payload.title,
    body: payload.body,
  });
  res.status(201).json({ notification });
});
