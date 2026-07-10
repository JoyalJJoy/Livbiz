import { z } from 'zod';

/**
 * Booking creation schema with attendee list
 */
export const bookingCreateSchema = z.object({
  slotId: z.string().min(1, 'Slot ID is required'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  totalPrice: z.number().positive('Price must be positive'),
  seats: z.number().int().positive('Seats must be at least 1').optional(),
  seatIds: z.array(z.string()).optional(),
  attendees: z.array(
    z.object({
      name: z.string().min(1, 'Attendee name is required'),
      email: z.string().email('Invalid email format'),
    })
  ).optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export type BookingCreate = z.infer<typeof bookingCreateSchema>;

/**
 * Booking approval/rejection schema
 */
export const bookingActionSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  action: z.enum(['approve', 'reject', 'cancel']).refine(
    (action) => ['approve', 'reject', 'cancel'].includes(action),
    'Action must be approve, reject, or cancel'
  ),
  adminNotes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export type BookingAction = z.infer<typeof bookingActionSchema>;

/**
 * User signup schema
 */
export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one number'),
  phone: z.string()
    .min(10, 'Phone must be at least 10 digits')
    .regex(/^\d{10}$/, 'Phone must be 10 digits')
    .optional(),
});

export type Signup = z.infer<typeof signupSchema>;

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type Login = z.infer<typeof loginSchema>;

/**
 * Ticket verification schema
 */
export const ticketVerifySchema = z.object({
  code: z.string().min(1, 'Ticket code is required').regex(/^[A-Z0-9]+$/, 'Invalid code format'),
});

export type TicketVerify = z.infer<typeof ticketVerifySchema>;

/**
 * Admin user search schema
 */
export const adminUserSearchSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['CLIENT', 'ADMIN', 'SUPER_ADMIN']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(50),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type AdminUserSearch = z.infer<typeof adminUserSearchSchema>;

/**
 * Password reset schema
 */
export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export type PasswordReset = z.infer<typeof passwordResetSchema>;

/**
 * Password reset confirm schema
 */
export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one number'),
});

export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>;
