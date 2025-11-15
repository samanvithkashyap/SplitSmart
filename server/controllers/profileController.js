import bcrypt from 'bcryptjs';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import { profileUpdateSchema, passwordUpdateSchema } from '../validation/schemas.js';
import { HttpError } from '../utils/httpError.js';

export const getProfile = asyncHandler(async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatarColor: req.user.avatarColor,
      monthlyBudget: req.user.monthlyBudget,
      preferences: req.user.preferences,
      createdAt: req.user.createdAt,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const payload = profileUpdateSchema.parse(req.body);
  const user = await User.findById(req.user._id);
  Object.assign(user, payload);
  await user.save();
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
      monthlyBudget: user.monthlyBudget,
      preferences: user.preferences,
      createdAt: user.createdAt,
    },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const payload = passwordUpdateSchema.parse(req.body);
  const user = await User.findById(req.user._id);
  const valid = await bcrypt.compare(payload.currentPassword, user.passwordHash);
  if (!valid) throw new HttpError(400, 'Current password incorrect');
  user.passwordHash = await bcrypt.hash(payload.newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated' });
});

export const getActivity = asyncHandler(async (_req, res) => {
  // Placeholder for future audit log integration
  res.json({
    activity: [
      { id: 1, type: 'login', detail: 'Logged in from Chrome on macOS', ts: new Date() },
      { id: 2, type: 'settings', detail: 'Updated notification preferences', ts: new Date() },
    ],
  });
});
