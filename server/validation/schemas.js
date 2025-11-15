import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const expenseCreateSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().default('general'),
  type: z.enum(['personal', 'group']).default('personal'),
  date: z.string().optional(),
  notes: z.string().optional(),
  splitWith: z
    .array(
      z.object({
        participantId: z.string(),
        share: z.number().positive(),
        settled: z.boolean().optional(),
      })
    )
    .optional(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export const savingsGoalSchema = z.object({
  label: z.string(),
  targetAmount: z.number().positive(),
  currentAmount: z.number().nonnegative().default(0),
  deadline: z.string().optional(),
});

export const billSchema = z.object({
  description: z.string(),
  total: z.number().positive(),
  participants: z
    .array(
      z.object({
        userId: z.string().optional(),
        name: z.string(),
        share: z.number().positive(),
      })
    )
    .min(1),
  dueDate: z.string().optional(),
});

export const billSettleSchema = z.object({
  participantId: z.string(),
});

export const billReminderSchema = z.object({
  message: z.string().max(280).optional(),
});

export const transactionFilterSchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
  category: z.string().optional(),
});

export const savingsProgressSchema = z.object({
  amount: z.number().positive(),
  note: z.string().optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  avatarColor: z.string().regex(/^#([0-9a-fA-F]{6})$/).optional(),
  monthlyBudget: z.number().nonnegative().optional(),
  preferences: z
    .object({
      currency: z.string().optional(),
      notifications: z
        .object({
          email: z.boolean().optional(),
          push: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export const notificationTestSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(3),
  type: z.string().default('info'),
});
